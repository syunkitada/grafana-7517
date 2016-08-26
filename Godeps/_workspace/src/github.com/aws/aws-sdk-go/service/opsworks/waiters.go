// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

package opsworks

import (
	"github.com/aws/aws-sdk-go/private/waiter"
)

func (c *OpsWorks) WaitUntilAppExists(input *DescribeAppsInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeApps",
		Delay:       1,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "status",
				Argument: "",
				Expected: 200,
			},
			{
				State:    "failure",
				Matcher:  "status",
				Argument: "",
				Expected: 400,
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *OpsWorks) WaitUntilDeploymentSuccessful(input *DescribeDeploymentsInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeDeployments",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "Deployments[].Status",
				Expected: "successful",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Deployments[].Status",
				Expected: "failed",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *OpsWorks) WaitUntilInstanceOnline(input *DescribeInstancesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeInstances",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "Instances[].Status",
				Expected: "online",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "setup_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "shutting_down",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "start_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stopped",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stopping",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "terminating",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "terminated",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stop_failed",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *OpsWorks) WaitUntilInstanceRegistered(input *DescribeInstancesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeInstances",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "Instances[].Status",
				Expected: "registered",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "setup_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "shutting_down",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stopped",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stopping",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "terminating",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "terminated",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stop_failed",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *OpsWorks) WaitUntilInstanceStopped(input *DescribeInstancesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeInstances",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "Instances[].Status",
				Expected: "stopped",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "booting",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "online",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "pending",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "rebooting",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "requested",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "running_setup",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "setup_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "start_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "stop_failed",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}

func (c *OpsWorks) WaitUntilInstanceTerminated(input *DescribeInstancesInput) error {
	waiterCfg := waiter.Config{
		Operation:   "DescribeInstances",
		Delay:       15,
		MaxAttempts: 40,
		Acceptors: []waiter.WaitAcceptor{
			{
				State:    "success",
				Matcher:  "pathAll",
				Argument: "Instances[].Status",
				Expected: "terminated",
			},
			{
				State:    "success",
				Matcher:  "error",
				Argument: "",
				Expected: "ResourceNotFoundException",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "booting",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "online",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "pending",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "rebooting",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "requested",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "running_setup",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "setup_failed",
			},
			{
				State:    "failure",
				Matcher:  "pathAny",
				Argument: "Instances[].Status",
				Expected: "start_failed",
			},
		},
	}

	w := waiter.Waiter{
		Client: c,
		Input:  input,
		Config: waiterCfg,
	}
	return w.Wait()
}
