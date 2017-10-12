<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.ip" placeholder="ip"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.hostname" placeholder="主机名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-autocomplete
                            v-model="filters.application_name"
                            :fetch-suggestions="queryAppSearchAsync"
                            placeholder="应用名称"
                            @select="handleSelect"
                    ></el-autocomplete>
                </el-form-item>
                <el-form-item>
                    <el-autocomplete
                            v-model="filters.business_group_name"
                            :fetch-suggestions="querySearchAsync"
                            placeholder="业务组名称"
                            @select="handleSelect"
                    ></el-autocomplete>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getApplications">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <p>
                    <el-form-item>
                        <el-input v-model="filters.sn" placeholder="sn"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="filters.status" placeholder="请选择主机状态">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                       :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="filters.agent_status" placeholder="请选择agent状态">
                            <el-option v-for="item in agent_options" :key="item.value" :label="item.label"
                                       :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </p>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="applications" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="expand">
                <template scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="主机名称">
                            <span>{{ props.row.hostname }}</span>
                        </el-form-item>
                        <el-form-item label="硬盘(G)">
                            <span>{{ props.row.disk_total }}</span>
                        </el-form-item>
                        <el-form-item label="操作系统">
                            <span>{{ props.row.os_info }}</span>
                        </el-form-item>
                        <el-form-item label="CPU 核数">
                            <span>{{ props.row.cpu_core_num }}</span>
                        </el-form-item>
                        <el-form-item label="内存(M)">
                            <span>{{ props.row.memory_total }}</span>
                        </el-form-item>
                        <el-form-item label="更新时间">
                            <span>{{ props.row.update_time }}</span>
                        </el-form-item>
                        <el-form-item label="机房">
                            <span>{{ props.row.zone }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="ip" label="IP" width="190" sortable>
            </el-table-column>
            <el-table-column prop="hostname" label="主机名称" width="220" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="sn 号" min-width="180" sortable>
            </el-table-column>
            <el-table-column prop="application_name" label="应用名称" min-width="180" sortable>
            </el-table-column>
            <el-table-column prop="business_group_name" label="业务名称" min-width="180" sortable>
            </el-table-column>
            <el-table-column prop="agent_status" label="agent 状态" width="150"
                             :filters="[{ text: '正常', value: 1 }, { text: '异常', value: 2 },{text:'下架',value:3},{text:'未安装',value :4}]"
                             :filter-method="filterTag" filter-placement="bottom-end">
                <template scope="scope">
                    <el-tag :type="scope.row.tag_agent_status_type" close-transition>
                        {{scope.row.tag_agent_status}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150"
                             :filters="[{ text: '库存', value: 0 }, { text: '上架', value: 1 },{text:'初始化',value:2},{text:'故障',value :3},{text:'下线',value:4}]"
                             :filter-method="filterStatusTag" filter-placement="bottom-end">
                <template scope="scope">
                    <el-tag :type='scope.row.tag_status_type' close-transition>
                        {{scope.row.tag_status}}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="total,sizes,prev, pager, next" @current-change="handleCurrentChange" :page-size="20"
                           :total="total" @size-change="handleSizeChange" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="主机名" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="操作系统">
                    <el-radio-group v-model="editForm.sex">
                        <el-radio class="radio" :label='1'>linux</el-radio>
                        <el-radio class="radio" :label='2'>windows</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker type="date" placeholder="选择日期" v-model="editForm.birth"></el-date-picker>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input type="textarea" v-model="editForm.addr"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="addForm.sex">
                        <el-radio class="radio" :label="1">男</el-radio>
                        <el-radio class="radio" :label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="addForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker type="date" placeholder="选择日期" v-model="addForm.birth"></el-date-picker>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input type="textarea" v-model="addForm.addr"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import {
        getHostListPage,
        removeUser,
        batchRemoveUser,
        editUser,
        addUser,
        getBusiness_group,
        getApplicationListPage
    } from '../../api/api';
    import ElInput from "../../../node_modules/element-ui/packages/input/src/input.vue";
    import ElFormItem from "../../../node_modules/element-ui/packages/form/src/form-item.vue";

    export default {
        components: {
            ElFormItem,
            ElInput
        },
        data() {
            return {
                filters: {
                    ip: '',
                    hostname: '',
                    sn: '',
                    business_group_name: '',
                    status: '',
                    agent_status: '',
                    application_name: '',


                },
                applications: [],
                total: 0,
                page: 1,
                page_size: 20,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    id: 0,
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                },

                //业务组搜索
                business_group: [],
                business_group_name: '',
                timeout: null,

                //应用名称
                application: [],
                application_name: '',

                //状态
                options: [{
                    value: '-1',
                    label: '全部'
                }, {
                    value: '0',
                    label: '库存'
                }, {
                    value: '1',
                    label: '上架'
                }, {
                    value: '2',
                    label: '初始化'
                }, {
                    value: '3',
                    label: '故障'
                }, {
                    value: '4',
                    label: '下线'
                }],

                //agent_status
                agent_options: [{
                    value: '-1',
                    label: '全部'
                }, {
                    value: '1',
                    label: '正常'
                }, {
                    value: '2',
                    label: '异常'
                }, {
                    value: '3',
                    label: '下架'
                }, {
                    value: '4',
                    label: '未安装'
                }]


            }
        },
        methods: {
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getApplications();
            },
            handleSizeChange(val) {
                this.page_size = val;
                console.log(this.page_size);
                this.getApplications();

            },
            // agent_status to  tag
            agent_status_to_tag(agent_status){
                var tag_agent_status = "";
                var tag_agent_status_type = "";
                switch (agent_status) {
                    case 1 :
                        tag_agent_status = "正常";
                        tag_agent_status_type = "success";
                        break;
                    case 2 :
                        tag_agent_status = "异常";
                        tag_agent_status_type = "danger";
                        break;
                    case 3 :
                        tag_agent_status = "下架";
                        tag_agent_status_type = "warning";
                        break;
                    case 4 :
                        tag_agent_status = "未安装";
                        tag_agent_status_type = "danger";
                        break;
                    default:
                        tag_agent_status = "未安装"
                        tag_agent_status_type = "danger";
                }
                return [tag_agent_status,tag_agent_status_type]
            },
            // status to tag
            status_to_tag(status){
                var tag_status = "";
                var tag_status_type = "";
                switch (status) {
                    case 0 :
                        tag_status = "库存";
                        tag_status_type = "grey";
                        break;
                    case 1 :
                        tag_status = "上架";
                        tag_status_type = "success";
                        break;
                    case 2 :
                        tag_status = "初始化";
                        tag_status_type = "primary";
                        break;
                    case 3 :
                        tag_status = "故障";
                        tag_status_type = "danger";
                        break;
                    case 4 :
                        tag_status = "下线";
                        tag_status_type = "warning";
                        break;
                    default:
                        tag_status = "库存"
                        tag_status_type = "grey";
                }
                return [tag_status,tag_status_type]
            },
            //获取主机列表
            getApplications() {
                let para = {
                    page: this.page,
                    page_size: this.page_size,
                    hostname: this.filters.hostname,
                    sn: this.filters.sn,
                    ip: this.filters.ip,
                    business_group_name: this.filters.business_group_name,
                    application_name: this.filters.application_name,
                    status: this.filters.status,
                    agent_status: this.filters.agent_status,

                };
                this.listLoading = true;
                getHostListPage(para).then((res) => {
                    for (var i = 0; i < res.data.res.length; i++) {
                        var row = res.data.res[i];
                        var agent_status = row.agent_status;
                        var status = row.status;

                        //agent_status to tag
                        var tag_res = this.agent_status_to_tag(agent_status)
                        var tag_agent_status = tag_res[0]
                        var tag_agent_status_type = tag_res[1]

                        //status to tag
                        var tag_status_res = this.status_to_tag(status)
                        var tag_status = tag_status_res[0];
                        var tag_status_type = tag_status_res[1];


                        res.data.res[i].tag_agent_status = tag_agent_status;
                        res.data.res[i].tag_agent_status_type = tag_agent_status_type;
                        res.data.res[i].tag_status = tag_status;
                        res.data.res[i].tag_status_type = tag_status_type;

                        if (row.network_interface[0]) {
                            var ip = row.network_interface[0].ip[0]; //IP 只取第一个
                            var ip_addr = ip.ip_addr;
                            res.data.res[i].ip = ip_addr;
                        }

                    }
                    this.total = res.data.total_count;
                    this.applications = res.data.res;
                    this.listLoading = false;
                });
            },
            //filter agent_status tag
            filterTag(value, row) {
                return row.agent_status === value;
            },
            //filter status tag
            filterStatusTag(value, row) {
                return row.status === value;
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {id: row.id};
                    removeUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            editUser(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            addUser(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            },

            //业务组搜索
            loadAll() {

                let param = {};
                var business_group_name = [];
                getBusiness_group(param).then((results) => {
                    var business_group = results.data.res;

                    for (var i = 0; i < business_group.length; i++) {
                        business_group_name.push({
                            "value": business_group[i].name,
                            "address": business_group[i].department_id
                        })
                    }


                });

                return business_group_name;

            },
            querySearchAsync(queryString, cb) {
                var restaurants = this.business_group;
                var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;

                cb(results);
//                clearTimeout(this.timeout);
//                this.timeout = setTimeout(() => {
//                    cb(results);
//                }, 3000 * Math.random());
            },
            createStateFilter(queryString) {
                return (state) => {
                    return (state.value.indexOf(queryString.toLowerCase()) === 0);
                };
            },
            handleSelect(item) {
                console.log(item);
            },

            //应用名称
            loadApplicationNameAll() {

                let param = {
                    page: 1,
                    page_size: 100000,
                };
                var app_name = [];
                getApplicationListPage(param).then((results) => {
                    var app = results.data.res;

                    for (var i = 0; i < app.length; i++) {
                        app_name.push({
                            "value": app[i].name,
                            "address": app[i].department_id
                        })
                    }


                });

                return app_name;

            },
            queryAppSearchAsync(queryString, cb) {
                var restaurants = this.application;
                var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;

                cb(results);
//                clearTimeout(this.timeout);
//                this.timeout = setTimeout(() => {
//                    cb(results);
//                }, 3000 * Math.random());
            },

        },
        mounted() {
//            this.getUsers();
            this.getApplications();
            this.business_group = this.loadAll();
            this.application = this.loadApplicationNameAll();
        }
    }

</script>

<style scoped>
    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }

</style>