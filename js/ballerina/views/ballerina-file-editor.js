/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define(['lodash', 'jquery', 'log', 'ast_visitor', './service-definition-view'], function (_, $, log, ASTVisitor, ServiceDefinitionView) {

    /**
     * @class BallerinaFileEditor
     * @augments ASTVisitor
     * @param args {Object}
     * @constructor
     */
    var BallerinaFileEditor = function (args) {
        this._canvasList = _.get(args, 'canvasList', []);
        this._model =  _.get(args, 'model', null);
        this.id = "Ballerina File Editor";
        this._options =  _.get(args, 'viewOptions', {});
        this.init();
    };

    BallerinaFileEditor.prototype = Object.create(ASTVisitor.prototype);
    BallerinaFileEditor.prototype.constructor = BallerinaFileEditor;

    BallerinaFileEditor.prototype.getId = function () {
        return this.id;
    };

    BallerinaFileEditor.prototype.setId = function (id) {
        this.id = id;
    };

    BallerinaFileEditor.prototype.addCanvas = function (canvas) {
        if (!_.isNil(canvas)) {
            this._canvasList.push(canvas);
        }
        else {
            log.error("Unable to add empty canvas" + canvas);
        }
    };

    BallerinaFileEditor.prototype.canVisitBallerinaASTRoot = function(ballerinaASTRoot){
        return true;
    };
    BallerinaFileEditor.prototype.visitBallerinaASTRoot = function(ballerinaASTRoot){

    };

    BallerinaFileEditor.prototype.canVisitServiceDefinition = function(serviceDefinition){
        return true;
    };
    BallerinaFileEditor.prototype.visitServiceDefinition = function(serviceDefinition){
        var serviceDefinitionView = new ServiceDefinitionView({model: serviceDefinition});
        this.addCanvas(serviceDefinitionView)
    };

    BallerinaFileEditor.prototype.init = function() {
        var errMsg;
        if (!_.has(this._options, 'container')) {
            errMsg = 'unable to find configuration for container';
            log.error(errMsg);
            throw errMsg;
        }
        var container = $(_.get(this._options, 'container'));
        // check whether container element exists in dom
        if (!container.length > 0) {
            errMsg = 'unable to find container for file editor with selector: ' + _.get(this._options, 'container');
            log.error(errMsg);
            throw errMsg;
        }
        if (!_.isNil(this._model)) {

            if (_.has(this._model, 'serviceDefinitions')) {

                var serviceDefs = $(_.get(this._model, 'serviceDefinitions'));
                _.each(serviceDefs, function (serviceModel) {

                    //TODO: Add serviceModel id and css props
                    var serviceContainer = $('<div class="outer-box"><svg class="service-container"></svg></div>');
                    serviceContainer.attr('id', serviceModel.id);
                    serviceContainer.attr('name','service');
                    editorParent.addCanvas(serviceContainer);
                });
            }
            if (_.has(this._model, 'functionDefinitions')) {
                _.each( this._model.functionDefinitions, function (functionModel) {
                    var functionContainer = $('<div>Function View Container</div>');
                    functionContainer.attr('id', functionModel.id);
                    functionContainer.attr('name','function');
                    editorParent.addCanvas(functionContainer);
                });
            }
            if (_.has(this._model, 'connectorDefinitions')) {
                _.each(this._model.connectorDefinitions, function (connectorModel) {
                    var connectorContainer = $('<div>Connector View Container</div>');
                    connectorContainer.attr('id', connectorModel.id);
                    connectorContainer.attr('name','connector');
                    editorParent.addCanvas(connectorContainer);
                });
            }
            //TODO: rest of definitions when implemented
        }
        else {
            log.error("Provided astRoot is undefined");
        }
        this.render(container);
    };

    BallerinaFileEditor.prototype.render = function (parent) {
        if (!_.isNil(this._canvasList)) {
            _.each(this._canvasList, function (canvas) {
                //draw a collapse accordion
                var outerDiv = $('<div></div>');
                // TODO: For the moment disabling the adding classes in order to show the containers
                 outerDiv.addClass('panel panel-default container-outer-div');
                var panelHeading = $('<div></div>');
                //panelHeading.addClass('panel-heading');
                //TODO: UPDATE ID
                panelHeading.attr('id', canvas[0].id + 3).attr('role', 'tab');
                var panelTitle = $('<h4></h4>');
                panelTitle.addClass('panel-title');
                panelTitle.attr('style', 'border-style:solid;border-width:1px;');
                var panelIcon = $('<i></i>');
                panelIcon.attr('style', 'padding:10px;background-color:black;');
                if(canvas[0].getAttribute('name') == "service") {
                    panelIcon.addClass('fw fw-dgm-service fw-inverse');
                } else if (canvas[0].getAttribute('name') == "connector") {
                    panelIcon.addClass('fw fw-dgm-connector fw-inverse');
                } else if(canvas[0].getAttribute('name') == "function") {
                    panelIcon.addClass('fw fw-function fw-inverse');
                }
                panelTitle.append(panelIcon);
                var titleLink = $('<a style="padding-left: 10px;">'+ canvas[0].getAttribute('name') + '</a>');
                titleLink.addClass("collapsed");
                //TODO: update href,aria-controls
                titleLink.attr('role', 'button').attr('data-toggle', 'collapse').attr('data-parent', "#accordion").attr('href', '#' + canvas[0].id).attr('aria-expanded', 'false').attr('aria-controls', canvas[0].id);
                panelTitle.append(titleLink);

                var panelRightIcon = $('<i></i>');
                panelRightIcon.addClass('fw fw-down pull-right right-icon-clickable');
                panelRightIcon.attr('style', 'padding:10px;');
                panelRightIcon.attr('role', 'button').attr('data-toggle', 'collapse').attr('data-parent', "#accordion").attr('href', '#' + canvas[0].id).attr('aria-expanded', 'false').attr('aria-controls', canvas[0].id);
                panelTitle.append(panelRightIcon);

                panelHeading.append(panelTitle);

                titleLink.click(function () {
                    $(this).parent().find('i.right-icon-clickable').toggleClass('fw-down fw-up');
                });

                panelRightIcon.click(function () {
                    $(this).toggleClass('fw-down fw-up');
                });

                var bodyDiv = $('<div></div>');
                // TODO: For the moment disabling the adding classes in order to show the containers
                 bodyDiv.addClass('panel-collapse collapse');
                //TODO: UPDATE ID
                bodyDiv.attr('id', canvas[0].id).attr('aria-labelledby', canvas[0].id + 3).attr('role', 'tabpanel').attr('style', 'border-style:solid;border-width:1px;');
                canvas.addClass('panel-body');
                bodyDiv.append(canvas);

                outerDiv.append(panelHeading);
                outerDiv.append(bodyDiv);

                // append to parent
                parent.append(outerDiv);
            });
        }
    };

    BallerinaFileEditor.prototype.getModel = function () {
        return this._model;
    };

    return BallerinaFileEditor;
});

