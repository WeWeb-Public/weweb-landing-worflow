<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
    <div class="section-container">
        <svg xmlns="http://www.w3.org/2000/svg" display="none">
            <svg id="small-particle"
                 width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.70233" y="2.2589" width="43.971" height="43.9594" rx="10"
                      transform="matrix(0.990268 0.139173 -0.139104 0.990278 6.00218 -1.21496)" fill="#F6F6F6"
                      stroke="#2E85C2" stroke-width="4"/>
            </svg>
            <svg id="medium-particle"
                 width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.13468" y="1.85565" width="123.923" height="123.891" rx="30"
                      transform="matrix(0.997565 -0.069739 0.0697739 0.997563 -2.12428 7.07478)" fill="#F6F6F6"
                      stroke="#FDC806" stroke-width="4"/>
            </svg>
            <svg id="big-particle"
                 width="269" height="269" viewBox="0 0 269 269" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.85558" y="2.1346" width="251.846" height="251.783" rx="30"
                      transform="matrix(0.997565 0.069739 -0.0697739 0.997563 16.0001 -2.1242)" fill="#F6F6F6"
                      stroke="#49B9B3" stroke-width="4"/>
            </svg>

        </svg>

        <!-- wwManager:start -->
        <wwSectionEditMenu :sectionCtrl="sectionCtrl"></wwSectionEditMenu>
        <!-- wwManager:end -->

        <!-- This is the background of the section -->
        <wwObject class="background"
                  :ww-object="section.data.background"
                  ww-category="background"></wwObject>

        <div class="particles-container">
            <svg class="particle big">
                <use xlink:href="#big-particle"></use>
            </svg>
            <svg class="particle medium">
                <use xlink:href="#medium-particle"></use>
            </svg>
            <svg class="particle small">
                <use xlink:href="#small-particle"></use>
            </svg>
        </div>

        <div class="workflow-section-content">
            <ul class="workflow-list">
                <li class="workflow-wrapper"
                    v-for="(workflow, index) in section.data.workflows"
                    :key="workflow.uniqueId">
                    <!-- wwManager:start -->
                    <wwContextMenu
                            class="ww-orange-button"
                            tag="div"
                            :options="elemOptions"
                            @remove="removeWorkflow(workflow)"
                            @addBefore="addWorkflowBefore(index)"
                            @addAfter="addWorkflowAfter(index)">
                        <wwOrangeButton></wwOrangeButton>
                    </wwContextMenu>
                    <!-- wwManager:end -->
                    <div class="workflow-item"
                         :class="{selected: isWorkFlowSelected(workflow)}">
                        <div class="workflow-title">
                            <wwObject tag="span"
                                      :ww-object="workflow.title"
                            ></wwObject>
                        </div>
                        <svg width="48" height="12" viewBox="0 0 48 12" fill="none" xmlns="http://www.w3.org/2000/svg"
                             class="workflow-icon">
                            <rect x="2.00014" y="2" width="44" height="8" rx="4"
                                  transform="matrix(1 0 6.93992e-05 1 -0.000138798 0)" stroke="#E02A4D"
                                  stroke-width="4"
                            />
                        </svg>
                        <div class="workflow-content">
                            <wwLayoutColumn tag="div"
                                            ww-default="ww-text"
                                            :ww-list="workflow.contentList"
                                            @ww-add="add(workflow.contentList, $event)"
                                            @ww-remove="remove(workflow.contentList, $event)">
                                <wwObject tag="div"
                                          ww-default="ww-text"
                                          v-for="item in workflow.contentList"
                                          :key="item.uniqueId"
                                          :ww-object="item"
                                >
                                </wwObject>
                            </wwLayoutColumn>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="navigator">
                <div class="navigator-selector"
                     v-bind:style="navigatorStyle">
                </div>
                <li v-for="(workflow, index) in section.data.workflows"
                    :key="workflow.uniqueId">
                    <div class="navigator-item"
                         @click="toggleWorkflow(workflow)">
                        <wwObject tag="span"
                                  :ww-object="workflow.navigatorText"
                                  class="navigator-text"
                                  :class="{selected:isWorkFlowSelected(workflow)}"
                                  ww-default="ww-text"
                        ></wwObject>
                    </div>

                </li>
            </ul>
        </div>
    </div>
</template>

<!-- This is your Javascript -->
<!-- ✨ Here comes the magic ✨ -->

<script>
    import playAnimationFrom from "./animation";

    const wwo = window.wwLib.wwObject;
    const wwu = window.wwLib.wwUtils;


    export default {
        name: "__COMPONENT_NAME__",
        props: {
            sectionCtrl: Object
        },
        data: () => ({
            nextParticlesPosition: 'right',
            selectedWorkflow: {},
            elemOptions: {
                items: [
                    {
                        text: {
                            en: 'Before',
                            fr: 'Avant'
                        },
                        icon: 'wwi wwi-add',
                        action: 'addBefore'
                    },
                    {
                        text: {
                            en: 'After',
                            fr: 'Apres'
                        },
                        icon: 'wwi wwi-add',
                        action: 'addAfter'
                    },
                    {
                        text: {
                            en: 'Delete',
                            fr: 'Supprimer'
                        },
                        icon: 'wwi wwi-delete',
                        action: 'remove'
                    }
                ]
            }
        }),
        computed: {
            section() {
                return this.sectionCtrl.get();
            },

            editMode() {
                return this.sectionCtrl.getEditMode() === 'CONTENT'
            },

            navigatorStyle() {
                const offset = this.section.data.workflows.indexOf(this.selectedWorkflow) * 120;
                return {
                    'margin-left': `${offset}px`
                }
            }
        },
        created() {
            // Initialize the data once the section is created in the DOM
            this.init()
        },
        mounted() {
            if (this.section.data.workflows.length > 0) {
                this.selectedWorkflow = this.section.data.workflows[0];
            }
        },
        methods: {
            init() {
                // Initialize section data
                let needUpdate = false

                // We will only save the data in this.section.data
                // So you need to put in there all the data of you WeWeb objects
                this.section.data = this.section.data || {};


                if (!this.section.data.background) {
                    this.section.data.background = wwo.getDefault({
                        type: 'ww-image'
                    });
                    needUpdate = true
                }

                if (!this.section.data.workflows) {
                    this.section.data.workflows = [this.createWorkflow()]
                    needUpdate = true
                }
                needUpdate && this.update();
            },
            getNewWorkflow: () => ({
                uniqueId: wwu.getUniqueId(),
                title: wwo.getDefault({type: 'ww-text'}),
                contentList: [],
                navigatorText: wwo.getDefault({type: 'ww-text'})
            }),
            createWorkflow() {
                let workflow = {}
                if (Array.isArray(this.section.data.workflows) && this.section.data.workflows.length > 0) {
                    workflow = JSON.parse(JSON.stringify(this.section.data.workflows[0]))
                    wwu.changeUniqueIds(workflow)
                    workflow.uniqueId = wwu.getUniqueId()
                    return workflow
                }
                return this.getNewWorkflow()
            },
            isWorkFlowSelected(workflow) {
                return workflow.uniqueId === this.selectedWorkflow.uniqueId
            },
            toggleWorkflow(workflow) {
                this.selectedWorkflow = workflow
                playAnimationFrom(this.nextParticlesPosition)
                this.nextParticlesPosition = this.nextParticlesPosition === 'right' ? 'left' : 'right'
            },

            addWorkflowBefore(index) {
                this.addWorkflowAt(index === 0 ? 0 : index - 1)
                this.update()
            },
            addWorkflowAfter(index) {
                this.addWorkflowAt(index + 1)
                this.update()
            },
            addWorkflowAt(index) {
                const {workflows} = this.section.data
                const head = workflows.slice(0, index)
                const tail = index === 0 ? workflows : workflows.slice(index + 1)
                this.section.data.workflows = [...head, this.createWorkflow(), ...tail]
            },
            removeWorkflow(workflow) {
                const {workflows} = this.section.data;
                if (workflows.length === 1) return
                this.section.data.workflows = workflows.filter(aWorkflow => aWorkflow !== workflow)
                this.update()
            },
            update() {
                debugger
                this.sectionCtrl.update(this.section);
            },

            // --------- EDITOR FUNCTIONS ---------
            // All the codes between /* wwManager:start */ and /* wwManager:end */ are only for editor purposes
            // So It won't in the published website!
            /* wwManager:start */
            add(list, options) {
                try {
                    list.splice(options.index, 0, options.wwObject);
                    this.sectionCtrl.update(this.section);
                } catch (error) {
                    wwLib.wwLog.error('ERROR : ', error);
                }
            },
            remove(list, options) {
                try {
                    list.splice(options.index, 1);
                    this.sectionCtrl.update(this.section);
                } catch (error) {
                    wwLib.wwLog.error('ERROR : ', error);
                }
            }
            /* wwManager:end */
        }
    };
</script>

<!-- This is your CSS -->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- Add lang="scss" or others to use computed CSS -->
<style lang="scss" scoped>

    .background {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .workflow-section-content {
        position: relative;
        padding: 274px 0;
        width: 768px;
        margin: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .workflow {
        &-list {
            position: relative;
            width: 100%;
            padding: 0;
            min-height: 200px;
            list-style-type: none;
        }

        &-wrapper {
            position: absolute;
            top: 0;
            width: 100%;
            min-height: 200px;
        }

        &-item {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            opacity: 0;
            z-index: 0;

            &.selected {
                opacity: 1;
                z-index: 0;
                transition: opacity 3000ms 500ms ease-out;
            }

        }

        &-title {
            font-family: Work Sans;
            font-style: normal;
            font-weight: bold;
            font-size: 36px;
            line-height: 42px;
            text-align: center;
            margin-bottom: 16px;
        }

        &-icon {
            margin-bottom: 16px;
        }

        &-content {
            display: flex;
            flex-direction: column;
            justify-items: center;
        }
    }

    .navigator {
        --color-navigator-text: #DADADA;
        --color-navigator-text-selected: #49B9B3;

        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 368px;
        height: 48px;
        margin-top: 64px;
        border-radius: 12px;
        padding: 4px;
        background-color: #FFFFFF;
        list-style-type: none;
        z-index: 3;

        &-item {
            cursor: default;
            pointer-events: all;
            width: 120px;
            overflow: hidden;
        }

        &-text {
            font-family: Work Sans;
            font-weight: bold;
            font-size: 24px;
            line-height: 28px;
            color: var(--color-navigator-text);

            &.selected {
                transition: color 500ms ease-in;
                color: var(--color-navigator-text-selected);
            }
        }

        &-selector {
            position: absolute;
            top: 4px;
            left: 4px;
            height: 40px;
            width: 120px;
            border-radius: 12px;
            background-color: rgba(73, 185, 179, 0.16);
            transition: margin-left 250ms ease-in;
        }
    }

    .particles-container {
        position: absolute;
        top: 250px;
        left: 50%;
        width: 0;
        margin: auto;
    }

    .particle {
        display: block;
        position: absolute;

        @media (max-width: 640px) {
            display: none;
        }

        &.big {
            top: 0;
            left: -660px;
            height: 270px;
            z-index: 10;
        }

        &.medium {
            top: 60px;
            left: -690px;
            z-index: 11;
        }

        &.small {
            top: 100px;
            left: -720px;
            z-index: 12;
        }
    }


</style>
