import { Construct, Stack, StackProps } from "@aws-cdk/core";
import {
  Function,
  Code,
  Runtime,
  CfnParametersCode,
} from "@aws-cdk/aws-lambda";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

interface ServiceStackProps extends StackProps {
  stageName: string;
}

export class ServiceStack extends Stack {
  public readonly serviceCode: CfnParametersCode;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    this.serviceCode = Code.fromCfnParameters();

    const lambdda = new Function(this, "ServiceLambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "src/lambda.handler",
      code: this.serviceCode,
      functionName: `ServiceLambda${props.stageName}`,
    });

    new HttpApi(this, "ServiceAPI", {
      defaultIntegration: new LambdaProxyIntegration({
        handler: lambdda,
      }),
      apiName: `MyService${props.stageName}`,
    });
  }
}
