Air Protocol Nitrogen Base
================

![NitrogenRelease](https://github.com/air-protocol/nitrogen/blob/master/Nitrogen.png?raw=true)


Prerequisites
-------------

Ensure that `gcloud config list` lists `peer2peerpoc` as the project.

Building and Deploying
----------------------

1. Get credentials for the Kubernetes cluster

        ./value_mesh get-credentials

2. Build the Docker image

        ./value_mesh build

3. Push the Docker image

        ./value_mesh push

4. Deploy to the Kubernetes cluster

        ./value_mesh deploy

Notes
-----

The version of the Docker image is controlled by the `version` member is `package.json`.
*Building or pushing an image with the same version as an existing image will generate an error.*
Overwriting an image in an image repository is possible but it is bad practice (like rewriting published history in git).
Furthemore, Kubernetes is designed to work with versioned images.
Changing the version mentioned in the deployment file causes Kubernetes to deploy new pods.
Using unversioned images leads to a more verbose deployment file and more deployment steps since the old pods need to be killed to force and image pull.


