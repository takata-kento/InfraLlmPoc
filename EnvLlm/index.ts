import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as lambda from "./Resources/Lambda/lambda";


const config = new pulumi.Config();

// AssumeRoleするIAMロール名を設定
const roleToAssumeARN = config.require("RoleCicdInfraLlmPoc");

// AssumeRoleするためのリソースプロバイダを定義
const provider = new aws.Provider("privileged", {
    assumeRole: {
        roleArn: roleToAssumeARN,
        sessionName: "PulumiSession",
        externalId: "PulumiApplication",
    },
    region: aws.config.requireRegion(),
});

// Lambdaの作成
const iamRole = "RoleLambdaAppLlmPoc";
const lambdaResourceSetting = new lambda.ResourceLambda(iamRole, "funcLlmPoc", "./Resources/Lambda/LambdaSrc/python/lambdaFunc.py");
const lambdaFunc = lambdaResourceSetting.create(provider);
export const funcId = lambdaFunc?.id;