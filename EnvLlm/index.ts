import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";


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
