/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing,
*  software distributed under the License is distributed on an
*  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*  KIND, either express or implied.  See the License for the
*  specific language governing permissions and limitations
*  under the License.
*/
package org.wso2.ballerina.core.runtime;

import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import org.wso2.ballerina.core.model.Annotation;
import org.wso2.ballerina.core.model.Application;
import org.wso2.ballerina.core.model.BallerinaFile;
import org.wso2.ballerina.core.model.Identifier;
import org.wso2.ballerina.core.model.Package;
import org.wso2.ballerina.core.model.Resource;
import org.wso2.ballerina.core.model.Service;
import org.wso2.ballerina.core.runtime.core.BalContext;
import org.wso2.ballerina.core.runtime.core.dispatching.ServiceDispatcher;
import org.wso2.ballerina.core.runtime.net.http.source.Constants;
import org.wso2.ballerina.core.runtime.net.http.source.HTTPResourceDispatcher;
import org.wso2.ballerina.core.runtime.net.http.source.HTTPServiceDispatcher;
import org.wso2.ballerina.core.runtime.registry.ApplicationRegistry;
import org.wso2.ballerina.core.runtime.registry.DispatcherRegistry;
import org.wso2.carbon.messaging.CarbonMessage;
import org.wso2.carbon.messaging.DefaultCarbonMessage;

/**
 * Test the functionality of HTTP Dispatchers
 *
 * @since 1.0.0
 */
public class HTTPDispatchingTest {

    @BeforeTest
    public void setup() {
        // Resister HTTP Dispatchers
        DispatcherRegistry.getInstance().registerServiceDispatcher(new HTTPServiceDispatcher());
        DispatcherRegistry.getInstance().registerResourceDispatcher(new HTTPResourceDispatcher());
    }

    @Test
    public void testHTTPDispatching() {

        // Create Ballerina Model
        Service service = new Service(new Identifier("service1"));
        service.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_BASE_PATH, "/base1"));
        Resource resource = new Resource();
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_PATH, "/sub"));
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_METHOD_GET));
        service.addResource(resource);
        BallerinaFile ballerinaFile = new BallerinaFile();
        ballerinaFile.addService(service);
        Package aPackage = new Package("org.sample.test");
        aPackage.addFiles(ballerinaFile);
        Application application = new Application("Ballerina-Resource-Test-App");
        application.addPackage(aPackage);

        // Register application
        ApplicationRegistry.getInstance().registerApplication(application);

        // Prepare the message
        CarbonMessage cMsg = new DefaultCarbonMessage();
        cMsg.setProperty(org.wso2.carbon.messaging.Constants.TO, "/base1/sub/foo");
        cMsg.setProperty(Constants.HTTP_METHOD, "GET");
        BalContext balContext = new BalContext(cMsg);
        balContext.setProperty(org.wso2.ballerina.core.runtime.Constants.PROTOCOL, Constants.PROTOCOL_HTTP);

        // Send the message
        ServiceDispatcher serviceDispatcher = DispatcherRegistry.getInstance().getServiceDispatcher(
                Constants.PROTOCOL_HTTP);
        Assert.assertTrue(serviceDispatcher.dispatch(balContext, null), "HTTP Dispatching failed");

    }

    @Test
    public void testDefaultBasePathDispatching() {

        // Create Ballerina Model
        Service service = new Service(new Identifier("service2"));
        service.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_BASE_PATH, Constants.DEFAULT_BASE_PATH));
        Resource resource = new Resource();
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_PATH, "/sub"));
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_METHOD_GET));
        service.addResource(resource);
        BallerinaFile ballerinaFile = new BallerinaFile();
        ballerinaFile.addService(service);
        Package aPackage = new Package("org.sample.test");
        aPackage.addFiles(ballerinaFile);
        Application application = new Application("Ballerina-Resource-Test-App");
        application.addPackage(aPackage);

        // Register application
        ApplicationRegistry.getInstance().registerApplication(application);

        // Prepare the message
        CarbonMessage cMsg = new DefaultCarbonMessage();
        cMsg.setProperty(org.wso2.carbon.messaging.Constants.TO, "/sub/foo");
        cMsg.setProperty(Constants.HTTP_METHOD, "GET");
        BalContext balContext = new BalContext(cMsg);
        balContext.setProperty(org.wso2.ballerina.core.runtime.Constants.PROTOCOL, Constants.PROTOCOL_HTTP);

        // Send the message
        ServiceDispatcher serviceDispatcher = DispatcherRegistry.getInstance().getServiceDispatcher(
                Constants.PROTOCOL_HTTP);
        Assert.assertTrue(serviceDispatcher.dispatch(balContext, null), "HTTP default base path dispatching failed");

    }

    @Test
    public void testDefaultResourcePathDispatching() {

        // Create Ballerina Model
        Service service = new Service(new Identifier("service3"));
        service.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_BASE_PATH, "/base3"));
        Resource resource = new Resource();
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_NAME_PATH, Constants.DEFAULT_SUB_PATH));
        resource.addAnnotation(new Annotation(Constants.ANNOTATION_METHOD_GET));
        service.addResource(resource);
        BallerinaFile ballerinaFile = new BallerinaFile();
        ballerinaFile.addService(service);
        Package aPackage = new Package("org.sample.test");
        aPackage.addFiles(ballerinaFile);
        Application application = new Application("Ballerina-Resource-Test-App");
        application.addPackage(aPackage);

        // Register application
        ApplicationRegistry.getInstance().registerApplication(application);

        // Prepare the message
        CarbonMessage cMsg = new DefaultCarbonMessage();
        cMsg.setProperty(org.wso2.carbon.messaging.Constants.TO, "/base3/abc/def");
        cMsg.setProperty(Constants.HTTP_METHOD, "GET");
        BalContext balContext = new BalContext(cMsg);
        balContext.setProperty(org.wso2.ballerina.core.runtime.Constants.PROTOCOL, Constants.PROTOCOL_HTTP);

        // Send the message
        ServiceDispatcher serviceDispatcher = DispatcherRegistry.getInstance().getServiceDispatcher(
                Constants.PROTOCOL_HTTP);
        Assert.assertTrue(serviceDispatcher.dispatch(balContext, null), "HTTP default resource path dispatch failed");

    }

}