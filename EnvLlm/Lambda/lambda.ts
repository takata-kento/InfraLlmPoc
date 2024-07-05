import * as aws from "@pulumi/aws";
import * as archive from "@pulumi/archive";
import * as assert from "@pulumi/pulumi/asset";

// Lambdaリソース作成クラス
export class ResourceLambda {
    /**
     * 実行ロール
     */
    readonly iamRole: string;
    /**
     * Lambda関数名
     */
    readonly functionName: string;
    /**
     * Lambdaソースコードファイル
     */
    readonly codeFile: string;
    /**
     * Lambdaランタイム
     * 基本的にpythonのみを想定しているため固定
     */
    readonly RUNTIME = "python3.7";

    /**
     * Lambdaリソースを作成するための初期化を行います。
     * @param iamRole ラムダ実行ロール
     * @param functionName Lambda関数名
     * @param codeFile Lambdaソースコードファイル
     */
    constructor(_iamRole: string, _functionName: string, _codeFile: string){
        this.iamRole = _iamRole;
        this.functionName = _functionName;
        this.codeFile = _codeFile;
    }

    /**
     * Lambdaリソースを作成します。
     * @param CloudWatchLogsにログを出力するかを指定(true:する/false:しない)
     * @param CICD実行ロールにAssumeRoleするためのProvider
     * @returns boolean型の結果を返します。(true:成功/false:失敗)
     */
    public create(_loggingFlag: boolean, _provider: aws.Provider): boolean{
        let isSuccess = false;
        let codeZip: Promise<archive.GetFileResult>;
        
        // Lambdaソースコードファイルをzip化します。
        try{
            codeZip = archive.getFile({
                type: "zip",
                sourceFile: this.codeFile,
                outputPath: "lambda.zip"
            });
        }catch(e){
            console.log("zipファイル作成中にエラーが発生しました。");
            console.log(e);
            return isSuccess;
        }

        // Lambdaリソースを作成します。
        try{
            new aws.lambda.Function(this.functionName,{
                code: new assert.FileArchive("lambda.zip"),
                name: this.functionName,
                role: this.iamRole,
                sourceCodeHash: codeZip.then(lambda => lambda.outputBase64sha256),
                runtime: this.RUNTIME
            },{
                provider: _provider
            })
            isSuccess = true;
        }catch(e){
            console.log("Lambdaリソース作成中にエラーが発生しました。");
            console.log(e);
            return isSuccess;
        }

        return isSuccess;
    }
}