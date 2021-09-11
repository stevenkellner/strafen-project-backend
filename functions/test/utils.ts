import {initializeApp} from "firebase/app";
import {getFunctions, httpsCallable, HttpsCallableResult} from "firebase/functions";
import {getDatabase, ref, onValue} from "firebase/database";
import {getAuth, signInWithEmailAndPassword, UserCredential} from "firebase/auth";
import {firebaseConfig} from "./firebaseConfig";
import {Fine} from "../src/TypeDefinitions/Fine";
import {guid} from "../src/TypeDefinitions/guid";
import {ReasonTemplate} from "../src/TypeDefinitions/ReasonTemplate";

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "europe-west1");
const database = getDatabase(app);
export const auth = getAuth();

export async function callFunction(functionName: string, parameters: any | null): Promise<HttpsCallableResult<unknown>> {
    return await httpsCallable(functions, functionName)(parameters);
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function signInTestUser(): Promise<UserCredential> {
    return await signIn("functions-tests-user@mail.com", "ghQshXA7rnDdGWj8GffSQN7VGrm9Qf3Z");
}

export async function getDatabaseValue(referencePath: string): Promise<any> {
    const reference = ref(database, referencePath);
    return new Promise((resolve, reject) => {
        onValue(reference, snapshot => {
            if (!snapshot.exists())
                return reject(new Error(`No data exists at path: ${referencePath}`));
            resolve(snapshot.val());
        });
    });
}

export async function getDatabaseFines(clubId: guid): Promise<Fine[]> {
    return Object.entries(await getDatabaseValue(`testableClubs/${clubId.guidString}/fines`)).map(value => {
        return Fine.fromObject({
            id: value[0],
            ...(value[1] as any),
        });
    });
}

export async function getDatabaseReasonTemplates(clubId: guid): Promise<ReasonTemplate[]> {
    return Object.entries(await getDatabaseValue(`testableClubs/${clubId.guidString}/reasonTemplates`)).map(value => {
        return ReasonTemplate.fromObject({
            id: value[0],
            ...(value[1] as any),
        });
    });
}