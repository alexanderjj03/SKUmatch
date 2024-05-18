import * as fs from "fs-extra";

export function readFileQueries(path: string): any[] {
    // Note: This method *must* be synchronous for Mocha
    const fileNames = fs.readdirSync(`test/resources/queries/${path}`);

    const allQueries: any[] = [];
    for (const fileName of fileNames) {
        const fileQuery = fs.readJSONSync(`test/resources/queries/${path}/${fileName}`);

        allQueries.push(fileQuery);
    }

    return allQueries;
}