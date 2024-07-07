import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as lambda from "./Resources/Lambda/lambda";


const config = new pulumi.Config();


// AssumeRoleするためのリソースプロバイダを定義
const provider = new aws.Provider("privileged", {
    assumeRole: {
        roleArn: "arn:aws:iam::369426526537:role/RoleCicdInfraLlmPoc",
        sessionName: "PulumiSession",
        externalId: "PulumiApplication",
    },
    region: aws.config.requireRegion(),
});

// Lambdaの作成
const iamRole = "arn:aws:iam::369426526537:role/RoleLambdaAppLlmPoc";
const lambdaResourceSetting = new lambda.ResourceLambda(iamRole, "funcLlmPoc", "./Resources/Lambda/LambdaSrc/python/lambdaFunc.py");
const lambdaFunc = lambdaResourceSetting.create(provider);
export const funcId = lambdaFunc?.id;