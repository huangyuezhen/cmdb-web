import axios from 'axios';

let base = 'http://10.10.50.30/api'

export const requestLogin = params => {
    return axios.post(`${base}/login`, params).then(res => res.data);
};
export const getHostListPage = params => {
    return axios.get(`${base}/host`, {params: params});
};

export const getBusiness_group = params=>{
    return axios.get(`${base}/business_group`,{params:params})
}

export  const  getApplicationListPage = params=>{
    return axios.get(`${base}/application`,{params:params})
}

export  const  getBusinessGroupListPage = params=>{
    return axios.get(`${base}/business_group`,{params:params})
}

export const getUserList = params => {
    return axios.get(`${base}/user/list`, {params: params});
};

export const removeUser = params => {
    return axios.get(`${base}/user/remove`, {params: params});
};

export const batchRemoveUser = params => {
    return axios.get(`${base}/user/batchremove`, {params: params});
};

export const editUser = params => {
    return axios.get(`${base}/user/edit`, {params: params});
};

export const addUser = params => {
    return axios.get(`${base}/user/add`, {params: params});
};

