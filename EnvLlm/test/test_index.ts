import * as pulumi from "@pulumi/pulumi";
import "mocha";
import * as fs from "fs";

// pulumiランタイムのモックを作成
pulumi.runtime.setMocks(
    {
        newResource: function(args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
            return {
                id: args.inputs.name + "_id",
                state: args.inputs
            };
        },
        call: function(args: pulumi.runtime.MockCallArgs) {
            return args.inputs;
        }
    },
    "project",
    "stack",
    false
);

describe("Infrastructure", function() {
    let infra: typeof import("../index");

    before(async function() {
        infra = await import("../index");
    })

    describe("#lambda_existszip",function() {
        it("must exist zip", function(done) {
            if (!fs.existsSync("../Resources/Lambda/LambdaSrc/zip/lambdaFunc.zip")){
                done(new Error("NOT Exist Lambda zip file."))
            } else {
                done();
            }
        })
    })
})