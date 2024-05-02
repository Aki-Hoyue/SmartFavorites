import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, ModalHeader, ModalBody, Input, List, Table } from "reactstrap";
import { Icon } from "../../components/Component";
import Toast from '../components/Toast';
import { useCookies } from 'react-cookie';

const RSSPage = () => {
    const [showToast, setShowToast] = useState(false);
    const [toastText, setToastText] = useState('');
    const [toastIcon, setToastIcon] = useState('alert-circle');
    const [toastReplay, setToastReplay] = useState(false);
    const [cookies] = useCookies(['userInfo']);
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
    
    const [modal, setModal] = useState(false);
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [result, setResult] = useState([]);
    const [rsscontent, setRsscontent] = useState([]);
    const [error, setError] = useState(false);

    const toggleModal = () => setModal(!modal);

    const handleNameChange = (e) => setName(e.target.value);
    const handleLinkChange = (e) => setLink(e.target.value);

    const clearInputs = () => {
        setName('');
        setLink('');
    }

    const addRSSFeed = async () => {
        try {
            await fetch('http://127.0.0.1:8000/addRss', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: cookies.userInfo.email,
                    uid: cookies.userInfo.uid,
                    loginAuth: cookies.userInfo.loginAuth,
                    name: name,
                    link: link
                }),
            });
            setToast("Add RSS success", 'check-circle');
        }
        catch (error) {
            setToast("Add RSS error: " + error, 'cross-circle');
        }
        clearInputs();
        showRSSLists();
        showRSSContent();
        setModal(false);
    }

    const deleteRSSFeed = async (urlid) => {
        try {
            await fetch('http://127.0.0.1:8000/deleteRss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: cookies.userInfo.email,
                uid: cookies.userInfo.uid,
                loginAuth: cookies.userInfo.loginAuth,
                urlid: urlid
            }),
            });
            setToast("Delete RSS success", 'check-circle');
        }
        catch (error) {
            setToast("Delete RSS error: " + error, 'cross-circle');
        }
        showRSSLists();
        showRSSContent();
    }

    const showRSSLists = async () => {
        const response = await fetch(`http://127.0.0.1:8000/getRssList?email=${cookies.userInfo.email}&uid=${cookies.userInfo.uid}&loginAuth=${cookies.userInfo.loginAuth}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setResult(await response.json());
    }

    const showRSSContent = async () => {
        const response = await fetch(`http://127.0.0.1:8000/rss?email=${cookies.userInfo.email}&uid=${cookies.userInfo.uid}&loginAuth=${cookies.userInfo.loginAuth}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        response.json().then(data => {
            if (response.status == 200){
                if (data.length > 0){
                    setError(false);
                    setRsscontent(data);
                }
                else {
                    setError(false);
                    setRsscontent([]);
                }
            }
            else {
                setToast("RSS error! Please check your network or your links and try again.", 'cross-circle');
                setError(true);
            }
        });
    }

    const toTime = (time) => {
        let date = new Date(time * 1000);
        let y = date.getFullYear() + "-";
        let m = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        let d = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
        return y+m+d;
    }

    useEffect(() => {
        showRSSLists();
        showRSSContent();
    }, []);

    return (
        <>
            {showToast && <Toast text={toastText} icon={toastIcon} showToast={showToast} setShowToast={setShowToast} replay={toastReplay} setReplay={setToastReplay}></Toast>}
            <Row>
                <Col><h6 className="nk-fmg-title">Integrate all your subscriptions.</h6> </Col>
                <Col><div className="d-flex justify-content-end">
                    <Button color="primary" onClick={toggleModal}>
                        <Icon name="plus"></Icon> <span>Add RSS Sources</span>
                    </Button>
                    <Modal isOpen={modal} toggle={toggleModal}>
                        <ModalHeader toggle={toggleModal}>
                            Add RSS Source
                        </ModalHeader>
                        <ModalBody>
                            <label className="form-label">RSS Source Name</label>
                            <Input placeholder="Source Name" value={name} onChange={handleNameChange} />
                            <label className="form-label mt-3">RSS Source Link</label>
                            <Input placeholder="Source Link" value={link} onChange={handleLinkChange} />
                        </ModalBody>
                        <div className="modal-footer">
                            <Button color="primary" onClick={addRSSFeed}>Confirm</Button>
                            <Button color="light" onClick={clearInputs}>Clear</Button>
                        </div>
                    </Modal>
                </div></Col>
            </Row>
            <hr />
            <h6 className="nk-fmg-title">RSS Links.</h6>
            <Table responsive>
                <thead>
                    <tr className="tb-tnx-head">
                        <th className="tb-tnx-id">
                            <span className="">#</span>
                        </th>
                        <th className="tb-tnx-info">
                            <span className="d-none d-sm-inline-block">
                                <span>RSS Sources Names</span>
                            </span>
                        </th>
                        <th className="tb-tnx-link">
                            <span className="tb-tnx-link">RSS Sources Links</span>
                        </th>
                        <th className="tb-tnx-action">
                            <span>Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {result.map((rss, index) => (
                        <tr key={index} className='tb-tnx-item'> 
                            <td className="tb-tnx-id">
                                <span className="tb-tnx-id">{rss.URLID}</span>
                            </td>
                            <td className="tb-tnx-info">{rss.Name}</td>
                            <td className="tb-tnx-link">
                                <a href={rss.Link} target="_blank">{rss.Link}</a>
                            </td>
                            <td className="tb-tnx-action">
                                <a href="#" className="btn btn-sm btn-danger" onClick={() => deleteRSSFeed(rss.URLID)}><Icon name="trash"></Icon>Delete</a>
                            </td>
                        </tr>
                    ))} 
                </tbody>
            </Table>
            <hr />

            <h6 className="nk-fmg-title">RSS Content.</h6>
            <Table responsive style={{ width: '100%' }}>
                <thead>
                    <tr className="tb-tnx-head">
                        <th className="tb-tnx-id">
                            <span className=" d-none d-sm-inline-block">#</span>
                        </th>
                        <th className="tb-tnx-title">
                            <span className="d-none d-sm-inline-block">Article</span>
                        </th>
                        <th className="tb-tnx-date" style={{ width: '100%' }}>
                            <span className="d-none d-sm-inline-block">Published Date</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rsscontent!=[] && rsscontent.map((rss, index) => (
                        <tr key={index} className='tb-tnx-item'> 
                            <td className="tb-tnx-id"><span className="tb-tnx-id">{index+1}</span></td>
                            <td className="tb-tnx-title">
                                <a href={rss.Link} target="_blank">{rss.Title}</a>
                            </td>
                            <td className="tb-tnx-date text-center">
                                <span>{toTime(rss.Published)}</span>
                            </td>
                        </tr>
                    ))}
                    {rsscontent==[] && <tr><td colSpan={3} className="text-center">No RSS Content.</td></tr>}
                    {error && <tr><td colSpan={3} className="text-center">RSS Fetch Error. Please check your network or your links.</td></tr>}
                </tbody>
            </Table>
        </>
    )
}

export default RSSPage

