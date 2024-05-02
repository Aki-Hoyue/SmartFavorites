import React, {useEffect, useState} from 'react'
import { Block, Icon, UserAvatar, Col } from "../../components/Component";
import { TabContent, TabPane, Modal, ModalBody, Button, ModalHeader, Input  } from "reactstrap";
import { findUpper } from "../../utils/Utils";
import UpdateAvatar from '../modals/UpdateAvatar';
import Toast from '../components/Toast';
import { set } from 'react-hook-form';
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from 'react-cookie';


const Settings = () => {
  const [cookies, setCookie] = useCookies(['userInfo']);
  const urlParams = new URLSearchParams(window.location.search);
  let tabValue = urlParams.get('tab') === null ? "general" : urlParams.get('tab').toString();
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastIcon, setToastIcon] = useState('alert-circle');
  const [toastReplay, setToastReplay] = useState(false);
  const setToast = async (text, icon) => {
    if (!showToast) {
      setToastReplay(false);
    }
    else {
      setToastReplay(true);
    }
    setToastText(text);
    setToastIcon(icon);
    setShowToast(true);
  }

  const [activeTab, setActiveTab] = useState(tabValue);
  const [editModal, setEditModal] = useState(false);


  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState(cookies.userInfo);


  const userNameChange = async (name) => {
    if (name === formData.name){
      setEditModal(false);
      return;
    }
    if (name === ''){
      setEditModal(false);
      setToast('Username cannot be empty', 'alert-circle');
      return;
    }
    const respone = await fetch('http://127.0.0.1:8000/changeUsername', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        uid: formData.uid,
        loginAuth: formData.loginAuth,
        username: name,
      }),
    });
    respone.json().then(data => {
      if (data["status_code"] != 200) {
        setToast('Failed to change username. Code: ' + data["status_code"] + '. Detail: '  + data["detail"], 'cross-circle');
    }});
    if (respone.status != 200) {
      console.log("Error: " + respone);
    }
    setFormData({ ...formData, name: name });
    setCookie('userInfo', JSON.stringify({ ...formData, name: name }), { path: '/', maxAge: 3 * 24 * 60 * 60 });
    setEditModal(false);
    setToast('Username changed successfully', 'check-circle');
  }

  const [current_password, setCurrentPassword] = React.useState("");
  const [new_password, setNewPassword] = React.useState("");
  const [confirm_password, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState(false);
  const [consistent, setConsistent] = React.useState(false);

  const changeCurrentPassword = (e) => {
    setCurrentPassword(e.target.value);
  }

  const changeNewPassword = (e) => {
    setNewPassword(e.target.value);
  }

  const changeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  }

  const clearPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(false);
    setConsistent(false);
  }

  const changePassword = async () => {
    if (current_password == "" || new_password == "" || confirm_password == "") {
      setError(true);
      return;
    }
    if (new_password != confirm_password) {
      setConsistent(true);
      return;
    }
    const response = await fetch('http://127.0.0.1:8000/changePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        uid: formData.uid,
        loginAuth: formData.loginAuth,
        password: current_password,
        newpassword: new_password,
      }),
    });
    response.json().then(data => {
      if (data["status_code"] != 200) {
        setToast('Failed to change password. Code: ' + data["status_code"] + '. Detail: '  + data["detail"], 'cross-circle');
      }
      else {
        setToast('Password changed successfully', 'check-circle');
        setModal(false);
        clearPassword();
      }
    });
    
  };

  const [uploadModal, setUploadModal] = useState(false);

  return (
    <>
      {showToast && <Toast text={toastText} icon={toastIcon} showToast={showToast} setShowToast={setShowToast} replay={toastReplay} setReplay={setToastReplay}></Toast>}
      <TabContent className="mt-0" activeTab={activeTab}>
        <TabPane tabId="general">
          <Block size="xs" className="pt-0">
            <div className="user-card user-card-md py-md-5 py-4">
              <UserAvatar size="md" text={findUpper(formData.name)} image={formData.avatar}>
                <a href="#edit" onClick={(ev) => {ev.preventDefault(); setUploadModal(true);}} className="edit edit-upload">
                  <Icon name="img"></Icon>
                </a>
              </UserAvatar>
              <div className="user-info">
                <span className="lead-text">
                  {formData.name}
                </span>
                <span className="sub-text">
                  {formData.email}
                </span>
              </div>
            </div>
            
            <div className="nk-data data-list">
              <div className="data-head">
                <h6 className="overline-title">Personal Basic</h6>
              </div>
              <div className="data-item">
                <div className="data-col">
                  <span className="data-label">UserName</span>
                  {!editModal && <span className="data-value text-soft text-center">{formData.name}</span>}
                  {editModal && <input id="usernameInput" type="text" className="form-control border border-primary" defaultValue={formData.name} onKeyDown={(ev) => ev.key === 'Enter' && userNameChange(ev.target.value)}></input>}
                </div>
                <div className="data-col data-col-end">
                  {!editModal && <a href="#edit" onClick={(ev) => { ev.preventDefault(); setEditModal(true);}} className="btn btn-primary">Edit</a>}
                  {editModal && <a href="#save" onClick={(ev) => { ev.preventDefault(); userNameChange(document.getElementById("usernameInput").value);}} className="btn btn-primary">Save</a>}
                </div>
              </div>
              <div className="data-item">
                <div className="data-col">
                  <span className="data-label">Email</span>
                  <span className="data-value text-soft text-center">{formData.email}</span>
                </div>
                <div className="data-col data-col-end">
                  <a>&nbsp;</a>
                </div>
              </div>
              <div className="data-item">
                <div className="data-col">
                  <span className="data-label">Change Password</span>
                  <span className="data-value"></span>
                </div>
                <div className="data-col data-col-end">
                  <a href="#edit" onClick={(ev) => {ev.preventDefault(); setModal(true);}} className="btn btn-primary">Change</a>
                </div>
              </div>
            </div>
          </Block>
        </TabPane>

      </TabContent>

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
          <ModalHeader toggle={() => setModal(!modal)}>
            Update Password
          </ModalHeader>
          <ModalBody>
              <label className="form-label">Current Password</label>
              <Input placeholder="Source Name" value={current_password} onChange={changeCurrentPassword} type='password' />
              {error && <p className="invalid text-danger">This field is required</p>}
              <label className="form-label mt-4">New Password</label>
              <Input placeholder="Source Link" value={new_password} onChange={changeNewPassword} type='password'/>
              {error && <p className="invalid text-danger">This field is required</p>}
              {consistent && <p className="invalid text-danger">Passwords do not match</p>}
              <label className="form-label mt-4">Confirm Password</label>
              <Input placeholder="Source Link" value={confirm_password} onChange={changeConfirmPassword} type='password' />
              {error && <p className="invalid text-danger">This field is required</p>}
              {consistent && <p className="invalid text-danger">Passwords do not match</p>}
          </ModalBody>
          <Col size="12">
              <div className="modal-footer">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li><Button color="primary" onClick={changePassword}>Change</Button></li>
                  <li><Button color="light" onClick={clearPassword}>Clear</Button></li>
                </ul>
              </div>
          </Col>
      </Modal>
      
      <Modal isOpen={uploadModal} toggle={() => setUploadModal(!uploadModal)}>
          <UpdateAvatar formData={formData} setFormData={setFormData} uploadModal={uploadModal} setUploadModal={setUploadModal} setToast={setToast}></UpdateAvatar>
      </Modal>
      
    </>
  )
}

export default Settings

