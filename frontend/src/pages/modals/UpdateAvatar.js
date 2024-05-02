import React, { useState } from "react";
import { Icon } from "../../components/Component";
import { Button, Input, ModalBody, Form, FormGroup, Label } from "reactstrap";
import { useForm } from "react-hook-form";
import { useCookies } from 'react-cookie';

const UploadAvatar = ({ formData, setFormData, UploadModal, setUploadModal, setToast }) => {
  const [cookies, setCookie] = useCookies(['userInfo']);
  const [avatar, setAvatar] = useState(formData.avatar);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(undefined);
  const [tab, setTab] = useState('network');

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();

  const handleNetworkImage = (data) => {
    setPreview(data.imageUrl);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    const data = new FormData();
    data.append('email', formData.email);
    data.append('uid', formData.uid);
    data.append('loginAuth', formData.loginAuth);
  
    if (tab === 'network') {
      const imageUrl = getValues("imageUrl");
      if (!imageUrl) {
        errors.imageUrl = true;
        setToast("Image URL is required", 'cross-circle');
        return;
      }
      data.append('avatar_url', imageUrl);
    } else if (tab === 'local') {
      if (!file) {
        setToast("File is required", 'cross-circle');
        errors.file = true;
        return;
      }
      data.append('avatar', file);
    }
  
    try {
      const response = await fetch('http://127.0.0.1:8000/changeAvatar', {
        method: 'POST',
        body: data,
      });
      response.json().then(data => {
        if (!data["status_code"] === 200) {
          setToast("Upload failed: Code: " + data["status_code"] + " Message: " + data["detail"], 'cross-circle');
        }
        else {
          setToast("Upload success", 'check-circle');
          const path = `http://127.0.0.1:8000${data["path"]}`;
          setFormData({ ...formData, avatar: path });
          setCookie('userInfo', JSON.stringify({ ...formData, avatar: path }), { path: '/', maxAge: 3 * 24 * 60 * 60 });
        }
      })
      
    } catch (error) {
      console.error('Upload failed:', error);
      setToast("Upload failed: " + error, 'cross-circle');
    }
    setUploadModal(false);
  };

  const handleClear = () => {
    setPreview(undefined);
    setFile(null);
    setValue("imageUrl", "");
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setValue("imageUrl", url, { shouldValidate: true });
    const isValidHttpUrl = (url) => {
      let isValid = false;
      try {
        const parsedUrl = new URL(url);
        isValid = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(parsedUrl.pathname);
      } catch (error) {
        isValid = false;
      }
      return isValid;
    };

    if (isValidHttpUrl(url)) {
      setPreview(url);
    } else {
      setPreview(undefined);
    }
  };

  return (
    <>
    <React.Fragment>
      <ModalBody>
        <Form onSubmit={handleSubmit(handleNetworkImage)}>
          <a
            href="#dropdownitem"
            onClick={(ev) => {
              ev.preventDefault();
              setUploadModal(false);
            }}
            className="close"
          >
          <Icon name="cross-sm"></Icon>
          </a>
          <h5 className="title">Upload to update Avatar</h5>
          
          <div className="nav nav-tabs">
            <a className={`nav-item nav-link ${tab === 'network' ? 'active' : ''}`} onClick={() => {setTab('network'); setPreview(undefined);}}>Network Image</a>
            <a className={`nav-item nav-link ${tab === 'local' ? 'active' : ''}`} onClick={() => {setTab('local'); setPreview(undefined);}}>Local Image</a>
          </div>
          <div className="tab-content">
            {tab === 'network' && (
              <div className="tab-pane active">
                <FormGroup>
                  <Label for="networkImageUrl">Enter network image address</Label>
                  <Input
                    id="networkImageUrl"
                    name="imageUrl"
                    type="url"
                    className="mt-3"
                    placeholder="Enter network image address"
                    {...register("imageUrl", { required: true })}
                    onChange={handleImageUrlChange}
                  />
                  {errors.imageUrl && <span className="text-danger">This field is required</span>}
                </FormGroup>
              </div>
            )}
            {tab === 'local' && (
              <div className="tab-pane active">
                <FormGroup>
                  <Label for="localImageFile">Choose a file or drag it here</Label>
                  <Input
                    id="localImageFile"
                    name="localImage"
                    type="file"
                    className="form-control mt-3"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {errors.file && <span className="text-danger">This field is required</span>}
                </FormGroup>
              </div>
            )}
          </div>
          {preview && (
            <div className="mt-3 w-100 d-flex justify-content-center align-items-center">
              <img src={preview} alt="Preview" style={{ maxWidth: "50%" }}/>
            </div>
          )}
          <div className="d-flex justify-content-end mt-3">
            <Button color="primary" onClick={handleUpload}>Upload</Button>
            <Button color="secondary" className="ms-3" onClick={handleClear}>Clear</Button>
          </div>
        </Form>
      </ModalBody>
    </React.Fragment>
    </>
  );
};

export default UploadAvatar;