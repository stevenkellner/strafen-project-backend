import {checkPrerequirements, FunctionDefaultParameters, FirebaseFunction, existsData, saveStatistic, undefinedAsNull} from "../utils";
import {ParameterContainer} from "../TypeDefinitions/ParameterContainer";
import {guid} from "../TypeDefinitions/guid";
import {ClubLevel} from "../TypeDefinitions/ClubLevel";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {ChangeType} from "../TypeDefinitions/ChangeType";
import {Reference} from "@firebase/database-types";
import {Fine} from "../TypeDefinitions/Fine";

/**
 * Type of Parameters for ChangeFineFunction
 */
type FunctionParameters = FunctionDefaultParameters & { clubId: guid, changeType: ChangeType, fine: Fine }

/**
 * @summary
 * Changes a element of fine list.
 *
 * Saved statistik:
 *  - name: changeFine
 *  - properties:
 *      - previousFine ({@link Fine} | null): Previous fine to change
 *      - changedFine ({@link Fine} | { id: guid; }): Changed fine or only id if change type is `delete`
 *
 * @params
 *  - privateKey (string): private key to check whether the caller is authenticated to use this function
 *  - clubLevel ({@link ClubLevel}): level of the club change
 *  - clubId ({@link guid}): id of the club to force sign out the person
 *  - changeType ({@link ChangeType}}): type of the change
 *  - fine ({@link Fine}): fine to change or null if change type is `delete`
 *
 * @throws
 *  - {@link functions.https.HttpsError}:
 *    - permission-denied: if private key isn't valid or the function is called while unauthendicated
 *    - invalid-argument: if a required parameter isn't give over or if a parameter hasn't the right type
 *    - internal: if couldn't change fine in database
 */
export class ChangeFineFunction implements FirebaseFunction {

    /**
     * Parameters needed for this function.
     */
    private parameters: FunctionParameters;

    /**
     * Initilizes function with given over data.
     * @param {any} data Data to get parameters from.
     */
    constructor(data: any) {
        const parameterContainer = new ParameterContainer(data);
        this.parameters = ChangeFineFunction.parseParameters(parameterContainer);
    }

    /**
     * Parses parameters for this function from a parameter container.
     * @param {ParameterContainer} container Parameter container to get parameters from.
     * @return {FunctionParameters} Parsed parameters for this function.
     */
    private static parseParameters(container: ParameterContainer): FunctionParameters {
        return {
            privateKey: container.getParameter("privateKey", "string"),
            clubLevel: ClubLevel.fromParameterContainer(container, "clubLevel"),
            clubId: guid.fromParameterContainer(container, "clubId"),
            changeType: ChangeType.fromParameterContainer(container, "changeType"),
            fine: Fine.fromParameterContainer(container, "fine"),
        };
    }

    private getFineRef(): Reference {
        const clubPath = `${this.parameters.clubLevel.getClubComponent()}/${this.parameters.clubId.guidString}`;
        const finePath = `${clubPath}/fines/${this.parameters.fine.id.guidString}`;
        return admin.database().ref(finePath);
    }

    /**
     * Executes this firebase function.
     * @param {{uid: string} | undefined} auth Authentication state.
     */
    async executeFunction(auth?: { uid: string }): Promise<void> {

        // Check prerequirements
        await checkPrerequirements(this.parameters, auth, this.parameters.clubId);

        // Get previous fine
        const fineRef = this.getFineRef();
        const fineSnapshot = await fineRef.once("value");
        let previousFine: Fine | null = null;
        if (fineSnapshot.exists())
            previousFine = Fine.fromObject(fineSnapshot.val());

        // Change fine
        let changedFine: any | { id: guid; };
        switch (this.parameters.changeType.value) {
        case "delete":
            await this.deleteItem();
            changedFine = {id: this.parameters.fine.id};
            break;

        case "update":
            await this.updateItem();
            changedFine = this.parameters.fine.object;
            break;
        }

        // Save statistic
        const clubPath = `${this.parameters.clubLevel.getClubComponent()}/${this.parameters.clubId.guidString}`;
        await saveStatistic(clubPath, {
            name: "changeFine",
            properties: {
                previousFine: undefinedAsNull(previousFine?.object),
                changedFine: changedFine,
            },
        });
    }

    private async deleteItem(): Promise<void> {
        const fineRef = this.getFineRef();
        if (await existsData(fineRef)) {
            await fineRef.remove(error => {
                if (error != null)
                    throw new functions.https.HttpsError("internal", `Couldn't delete fine, underlying error: ${error.name}, ${error.message}`);
            });
        }
    }

    private async updateItem(): Promise<void> {
        const fineRef = this.getFineRef();
        await fineRef.set(this.parameters.fine?.objectWithoutId, error => {
            if (error != null)
                throw new functions.https.HttpsError("internal", `Couldn't update fine, underlying error: ${error.name}, ${error.message}`);
        });
    }
}
