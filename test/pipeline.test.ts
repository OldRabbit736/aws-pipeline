import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  SynthUtils,
  haveResourceLike,
  arrayWith,
  objectLike,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { App } from "@aws-cdk/core";
import { BillingStack } from "../lib/billing-stack";
import * as Pipeline from "../lib/pipeline-stack";
import { ServiceStack } from "../lib/service-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Pipeline.PipelineStack(app, "MyTestStack");
  // THEN

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test("Adding service stage", () => {
  // GIVEN
  const app = new App();
  const serviceStack = new ServiceStack(app, "ServiceStack", {
    stageName: "Test",
  });
  const pipelineStack = new Pipeline.PipelineStack(app, "PipelineStack");

  // WHEN
  pipelineStack.addServiceStage(serviceStack, "TestStage");

  // THEN
  expectCDK(pipelineStack).to(
    haveResourceLike("AWS::CodePipeline::Pipeline", {
      Stages: arrayWith(
        objectLike({
          Name: "TestStage",
        })
      ),
    })
  );
});

test("Adding billing stack to a stage", () => {
  // GIVEN
  const app = new App();
  const serviceStack = new ServiceStack(app, "ServiceStack", {
    stageName: "Test",
  });
  const pipelineStack = new Pipeline.PipelineStack(app, "PipelineStack");
  const billingStack = new BillingStack(app, "BillingStack", {
    budgetAmount: 5,
    emailAddress: "test@example.com",
  });
  const testStage = pipelineStack.addServiceStage(serviceStack, "TestStage");

  // WHEN
  pipelineStack.addBillingStackToStage(billingStack, testStage);

  // THEN
  expectCDK(pipelineStack).to(
    haveResourceLike("AWS::CodePipeline::Pipeline", {
      Stages: arrayWith(
        objectLike({
          Actions: arrayWith(
            objectLike({
              Name: "Billing_Update",
            })
          ),
        })
      ),
    })
  );
});
