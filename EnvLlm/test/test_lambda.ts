import * as pulumi from "@pulumi/pulumi";
import { Function } from "@pulumi/aws/lambda";
import "mocha";
import * as fs from "fs";
import { ResourceLambda } from "../Resources/Lambda/lambda";
import * as aws from "@pulumi/aws";

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
    let lambda_logconfig: ResourceLambda;
    let provider: aws.Provider;

    describe("#lambda_logconfig",function() {
        before(function() {
            lambda_logconfig = new ResourceLambda("arn:aws:iam::123456789012:role/RoleCicdInfraLlmPoc","lambda_logconfig","lambdaFunc.zip");

            provider = new aws.Provider("privileged", {
                assumeRole: {
                    roleArn: "arn:aws:iam::123456789012:role/RoleCicdInfraLlmPoc",
                    sessionName: "PulumiSession",
                    externalId: "PulumiApplication",
                },
            });
        })

        it("check log config", function(done) {
            let lambda_resource = lambda_logconfig.create(provider);
            pulumi.all([lambda_resource?.urn, lambda_resource?.loggingConfig]).apply(([urn, loggingConfig]) => {
                if (!(loggingConfig?.logFormat === "Text")){
                    done(new Error(`ログフォーマットがTextになっていません。urn -> ${urn}`));
                }else if (!(loggingConfig?.systemLogLevel === undefined)){
                    done(new Error(`システムログレベルが設定されてしまっています。ログフォーマット"Text"では指定できません。urn -> ${urn}`));
                }else {
                    done();
                }
            })
        })
    })
})