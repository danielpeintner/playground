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

/**
 * @file Uses a hardcoded example TD-string to check whether running the assertion
 * 		 function on it throws any errors and allow manually checking the result
 * 		 output on the console.
 */
const tdAsserter = require("../index").tdAssertions;
const fs = require("fs");

const simpleTD = JSON.stringify({
    id: "urn:simple",
    "@context": "https://www.w3.org/2022/wot/td/v1.1",
    title: "MyLampThing",
    description: "Valid TD copied from the specs first example",
    securityDefinitions: {
        basic_sc: {
            scheme: "basic",
            in: "header",
        },
    },
    security: ["basic_sc"],
    properties: {
        status: {
            type: "string",
            forms: [
                {
                    href: "https://mylamp.example.com/status",
                },
            ],
        },
    },
    actions: {
        toggle: {
            forms: [
                {
                    href: "https://mylamp.example.com/toggle",
                },
            ],
        },
    },
    events: {
        overheating: {
            data: {
                type: "string",
            },
            forms: [
                {
                    href: "https://mylamp.example.com/oh",
                    subprotocol: "longpoll",
                },
            ],
        },
    },
});

function fileLoad(loc) {
    return new Promise((res, rej) => {
        fs.readFile(loc, "utf8", (err, data) => {
            if (err) {
                rej(err);
            } else {
                res(data);
            }
        });
    });
}

tdAsserter([simpleTD], fileLoad).then(
    (result) => {
        console.log("OKAY");
        // console.log(result.merged)
        // console.log(result)
    },
    (err) => {
        console.log("ERROR");
        console.error(err);
    }
);
