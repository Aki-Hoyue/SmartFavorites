import React, {useEffect, useState} from 'react'
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import { Block, Icon, UserAvatar } from "../../components/Component";
import { Nav, NavItem, NavLink, Row, Col, TabContent, TabPane,  Card, Button, Badge, Modal  } from "reactstrap";
import data from "../Data"
import { findUpper } from "../../utils/Utils";
import ProfileUpdate from "../modals/ProfileUpdate";
import classnames from 'classnames';

const Settings = () => {
  
  const urlParams = new URLSearchParams(window.location.search);
  let tabValue = urlParams.get('tab') === null ? "general" : urlParams.get('tab').toString();

  const [activeTab, setActiveTab] = useState(tabValue);
  const {fileManager} = useFileManager();
  const {fileManagerUpdate} = useFileManagerUpdate();

  useEffect(() => {
    setActiveTab(tabValue);
  }, [tabValue]);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "Abu Bin Ishtiak",
    displayName: "Ishtiak",
    email: "info@softnio.com",
    phone: "",
    dob: "1980-08-10",
    language: data.languageOptions[0].value,
    dateFormat: data.dateFormat[0].value,
    timezone: data.timezoneFormat[0].value,
  });

  return (
    <>
      
      <TabContent className="mt-0" activeTab={activeTab}>
        <TabPane tabId="general">
          <Block size="xs" className="pt-0">
            <div className="user-card user-card-md py-md-5 py-4">
              <UserAvatar size="md" text={findUpper(formData.name)}>
                <a href="#edit" onClick={(ev) => ev.preventDefault()} className="edit edit-upload">
                  <Icon name="img"></Icon>
                </a>
              </UserAvatar>
              <div className="user-info">
                <span className="lead-text">
                  {formData.displayName}
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
                  <span className="data-label">Email</span>
                  <span className="data-value">{formData.email}</span>
                </div>
                <div className="data-col data-col-end">
                  <a
                    href="#edit"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setModal(true);
                    }}
                    className="link link-primary"
                  >
                    Edit
                  </a>
                </div>
              </div>
              <div className="data-item">
                <div className="data-col">
                  <span className="data-label">Change Password</span>
                  <span className="data-value"></span>
                </div>
                <div className="data-col data-col-end">
                  <a
                    href="#edit"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setModal(true);
                    }}
                    className="link link-primary"
                  >
                    Change
                  </a>
                </div>
              </div>
            </div>
          </Block>
        </TabPane>

      </TabContent>
      <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
        <ProfileUpdate formData={formData} setFormData={setFormData} setModal={setModal}></ProfileUpdate>
      </Modal>
    </>
  )
}

export default Settings