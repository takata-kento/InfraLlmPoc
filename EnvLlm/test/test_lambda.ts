import * as pulumi from "@pulumi/pulumi";
import { Function } from "@pulumi/aws/lambda";
import "mocha";
import * as fs from "fs";

// pulumiランタイムのモックを作成
pulumi.runtime.setMocks({
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
    let infra: typeof import("../Resources/Lambda/lambda");
    let lambda_logconfig;

    before(async function() {
        infra = (await import("../Resources/Lambda/lambda"));
        let lambda_logconfig = new infra.ResourceLambda("arn:aws:iam::123456789012:role/RoleCicdInfraLlmPoc","lambda_logconfig","lambdaFunc.zip");
    })

    describe("#lambda_logconfig",function() {
        it("check log config", function(done) {
            let lambda_resource : Function = lambda_logconfig.create();
            pulumi.all([lambda_resource.urn, lambda_resource.loggingConfig]).apply(([urn, loggingConfig]) => {
                if (!(loggingConfig.logFormat === "Text")){
                    done(new Error(`ログフォーマットがTextになっていません。urn -> ${urn}`));
                }else if (!(loggingConfig.systemLogLevel === null)){
                    done(new Error(`システムログレベルが設定されてしまっています。ログフォーマット"Text"では指定できません。urn -> ${urn}`));
                }else {
                    done();
                }
            })
        })
    })
})