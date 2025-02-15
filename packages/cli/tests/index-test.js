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

const { exec } = require("child_process");
const { fstat, existsSync } = require("fs");

/**
 * The testing processes stack object
 */
const processStack = {
    /**
     * Add a new test process
     * @param {string} command The command passed to `exec`
     * @param {string} comment Describe the test
     * @param {(sOut, sErr, lastErr?)=>boolean} cbTest Opt: Test executed after process execution
     */
    add(command, comment, cbTest) {
        this.stack.push(
            new Promise((res, rej) => {
                const details = {
                    sOut: "",
                    sErr: "",
                };
                const spawnedProcess = exec(command, (err, thisOut, thisErr) => {
                    if (err) {
                        details.lastErr = err;
                    }
                    details.sErr += thisErr;
                    details.sOut += thisOut;
                });
                spawnedProcess.on("exit", (statusCode) => {
                    res({ statusCode, command, comment, details, cbTest });
                });
            })
        );
    },
    /**
     * Wait for all process executions currently in the stack to be finished,
     * then evaluate their results
     */
    evaluate() {
        Promise.all(this.stack).then((results) => {
            results.forEach((result) => {
                result.passed =
                    result.cbTest !== undefined
                        ? result.cbTest(result.details.sOut, result.details.sErr, result.details.lastErr)
                        : "no-test";
                if (result.details.sErr !== "" || result.details.lastErr !== undefined) {
                    result.passed = false;
                }
            });
            console.log(
                results.map((result) => ({
                    statusCodeOK: result.statusCode === 0 ? true : false,
                    passed: result.passed,
                    command: result.command,
                    comment: result.comment,
                }))
            );

            // console.log(JSON.stringify(results, undefined, 4))

            const failed = [];
            failed.push(...results.filter((result) => result.statusCode !== 0 || result.passed === false));
            if (failed.length > 0) {
                failed.forEach((fail) => {
                    console.error(JSON.stringify(fail, undefined, 4));
                });
                process.exit(1);
            }
        });
    },
    /**
     * Contains the stacked processes
     * @private Should not be accessed directly
     */
    stack: [],
};

// TESTFLOW
processStack.add(
    "node ./index.js",
    "normal validation",
    (sOut) =>
        sOut.search("Warning test successful") !== -1 &&
        sOut.search("Invalidity test successful") !== -1 &&
        sOut.search("Validity test successful") !== -1
);
// processStack.add("node ./index.js -a", "normal assertions")
processStack.add("node ./index.js -p", "OpenAPI JSON generation", () => existsSync("./out/simple_openapi.json"));
processStack.add("node ./index.js -p --oap-yaml", "OpenAPI YAML generation", () =>
    existsSync("./out/simple_openapi.yaml")
);
processStack.add("node ./index.js --async-api", "AsyncAPI JSON generation", () =>
    existsSync("./out/simple_asyncapi.json")
);
processStack.add("node ./index.js --async-api --aap-yaml", "AsyncAPI YAML generation", () =>
    existsSync("./out/simple_asyncapi.yaml")
);
// test for junit output
processStack.add("node ./index.js --junit", "JUnit output testing", () => existsSync("junit-tests.xml"));
// test multiple inputs
processStack.add(
    "node ./index.js -i node_modules/@thing-description-playground/core/examples/tds/ " +
        "node_modules/@thing-description-playground/core/examples/tds/",
    "Check multiple inputs",
    (sOut) =>
        sOut.search("Warning test successful") !== -1 &&
        sOut.search("Invalidity test successful") !== -1 &&
        sOut.search("Validity test successful") !== -1 &&
        sOut.search("Warning test successful") !== -1 &&
        sOut.search("Invalidity test successful") !== -1 &&
        sOut.search("Validity test successful") !== -1
);

processStack.evaluate();
