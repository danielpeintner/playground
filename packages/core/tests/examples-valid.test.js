/*
 *  Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 *  See the NOTICE file(s) distributed with this work for additional
 *  information regarding copyright ownership.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Eclipse Public License v. 2.0 which is available at
 *  http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *  Document License (2015-05-13) which is available at
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *
 *  SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 */

const fs = require("fs");
const path = require("path");
const tdValidator = require("../index").tdValidator;
const tmValidator = require("../index").tmValidator;

const tdRootDir = path.join("./", "examples", "tds");
const tmRootDir = path.join("./", "examples", "tms");
const tdDirPath = path.join(tdRootDir, "valid");
const tmDirPath = path.join(tmRootDir, "valid");

const tdFileNames = fs.readdirSync(tdDirPath);
const tmFileNames = fs.readdirSync(tmDirPath);

const tdRefResult = {
    report: {
        json: "passed",
        schema: "passed",
        defaults: expect.stringMatching(/warning|passed/),
        jsonld: "passed",
        additional: expect.stringMatching(/warning|passed/),
    },
    details: {
        enumConst: "passed",
        linkedAffordances: expect.stringMatching(/warning|not-impl|pass/),
        linkedStructure: expect.stringMatching(/not-impl|pass/),
        propItems: "passed",
        security: "passed",
        propUniqueness: "passed",
        multiLangConsistency: "passed",
        linksRelTypeCount: "passed",
        readWriteOnly: "passed",
        uriVariableSecurity: "passed",
    },
    detailComments: expect.any(Object),
};

const tmRefResult = {
    report: {
        json: "passed",
        schema: "passed",
        defaults: null,
        jsonld: "passed",
        additional: "passed",
    },
    details: {
        enumConst: "passed",
        propItems: "passed",
        propUniqueness: "passed",
        multiLangConsistency: "passed",
        linksRelTypeCount: "passed",
        readWriteOnly: "passed",
        tmOptionalPointer: "passed",
    },
    detailComments: expect.any(Object),
};

for (const fileNames of [tdFileNames, tmFileNames]) {
    let validator;
    let dirPath;
    let refResult;
    if (fileNames === tdFileNames) {
        validator = tdValidator;
        dirPath = tdDirPath;
        refResult = tdRefResult;
    } else {
        validator = tmValidator;
        dirPath = tmDirPath;
        refResult = tmRefResult;
    }

    fileNames.forEach((fileName) => {
        test(fileName, (done) => {
            fs.readFile(path.join(dirPath, fileName), "utf-8", (err, docToTest) => {
                if (err) {
                    done(err);
                }
                validator(docToTest, () => {}, {}).then(
                    (result) => {
                        expect(result).toEqual(refResult);
                        done();
                    },
                    (errTwo) => {
                        done(errTwo);
                    }
                );
            });
        });
    });
}
