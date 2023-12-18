import React, { Component, } from 'react';

import {Card,Collapse } from 'antd';
import ipfs from './ipfs-util'
import healthRecord from "../contracts/DoctorAddRecord.json"
import getWeb3 from '../getWeb3';
import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
// import DisplayPayment from './common/displayPayment';
import './css/display_patient.css'
import axios from 'axios'

class DisplayPatientToCompany extends Component {
  constructor(props) {
    super(props);

    this.addConsultation = this.addConsultation.bind(this);
    this.getFile = this.getFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  state = {
    patient_name: "",
    patient_age: 0,
    patient_files: [],
    filesInfo: [],
    showPopup: [],
    files: [],
    doctorConsultation: [],
    doctorAddedFiles: [],
    doctorPassbook: [],
    doctorBalance: 0,
    file: null,
  };

  contract = this.props.contract[0];
  doctorAddRecord = this.props.contract[1];

  Acc = this.props.accounts;

  async loadcontract() {
    var web3 = await getWeb3();
    const networkId = await web3.eth.net.getId();
    var deployedNetwork = healthRecord.networks[networkId];

    this.doctorAddRecord = new web3.eth.Contract(
      healthRecord.abi,
      deployedNetwork && deployedNetwork.address
    );
  }
  async loadFiles() {
    const data = await this.contract.methods
      .getPatientInfoForDoctor(this.props.patient_address)
      .call({ from: this.Acc[0] });
    console.log("files", data);
    if (data[3])
      this.setState({
        patient_name: data[0],
        patient_age: data[1],
        files: data[3],
      });

    console.log("files", this.state.files);
  }

  async loadDoctorConsultation() {
    const data = await this.doctorAddRecord.methods
      .getDoctorConsultation(this.props.patient_address)
      .call({ from: this.Acc[0] });

    if (data) this.setState({ doctorConsultation: data });

    console.log("doctor consultation", this.state.doctorConsultation);
  }

  async loadDoctorAddedFiles() {
    try {
      const data = await this.doctorAddRecord.methods
        .getDoctorAddedFiles(this.props.patient_address)
        .call({ from: this.Acc[0] });
      if (data) this.setState({ doctorAddedFiles: data });

      console.log("doctor added files", this.state.doctorAddedFiles);
    } catch (e) {
      console.log(e);
    }
  }

  // async loadDoctorWallet(){
  //     try{
  //         const data = await this.contract.methods.getReceivedPayments().call({from:this.Acc[0]});
  //         if(data)
  //             this.setState({doctorPassbook: data[0], doctorBalance: data[1]});

  //         console.log(this.state.doctorPassbook);
  //         console.log(this.state.doctorBalance);
  //     }

  //     catch(e){
  //         console.log(e);
  //     }
  // }

  componentWillMount() {
    if (this.props.patient_address) this.loadFiles(this.props.patient_address);
    this.loadDoctorConsultation(this.props.patient_address);
    //uncomment after uncommenting from smart contract and after successful migration
    this.loadDoctorAddedFiles(this.props.patient_address);
    // console.log(this.doctorAddRecord)
    // this.loadDoctorWallet();
  }

  async addConsultation(event) {
    event.preventDefault();
    let consult = document.getElementById("consultation").value;
    let med = document.getElementById("medicine").value;
    let time_per = document.getElementById("time_period").value;
    let res = await this.contract.methods
      .addDoctorOfferedConsultation(
        this.props.patient_address,
        consult,
        med,
        time_per
      )
      .send({ from: this.Acc[0] });

    console.log(res);
    if (res) console.log("consultation added");
    else console.log("consultation failed");
  }

  updateFileHash = async (name, type, ipfshash) => {
    //sending transaction and storing result to state variables
    try {
      let res = await this.contract.methods
        .doctorAddFiles(this.props.patient_address, name, type, ipfshash)
        .send({ from: this.Acc[0] });
      console.log(res);
      if (res) console.log("file upload successful");
      else console.log("file upload unsuccessful");
    } catch (e) {
      console.log(e);
    }
  };

  async uploadFile(event) {
    event.preventDefault();
    if (!this.state.file) {
      console.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", this.state.file);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "e56a0d10deca898a1f17",
            pinata_secret_api_key:
              "a98f71ff3eb345a0545e536c946cc0c297ddf2a1b00e83e4eb8f81f50226311f",
          },
        }
      );

      console.log("File uploaded to IPFS:", response.data);

      this.updateFileHash(
        this.state.file.name,
        this.state.file.type,
        response?.data?.IpfsHash
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    // ipfs.files.add(this.state.buffer,(err,res)=>{
    //     if(err){
    //         console.error(err)
    //         return
    //     }

    //    this.updateFileHash(this.state.file.name,this.state.file.type,res[0].hash)
    // })
  }

  getFile(event) {
    event.preventDefault();
    console.log("getfile");
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result), file });

      console.log("buffer", file);
    };
  }

  showFile(hash) {
    let { files, doctorAddedFiles } = this.state;
    if (files.indexOf(hash) > -1 || doctorAddedFiles.indexOf(hash) > -1) {
      let path = `https://ipfs.io/ipfs/${hash[2]}`;
      console.log(path);
      window.open(path);
    }
  }

  render() {
    let { patient_address } = this.props;
    // let { patient_name, patient_age, files, doctorAddedFiles, doctorConsultation, doctorPassbook } = this.state;
    let {
      patient_name,
      patient_age,
      files,
      doctorAddedFiles,
      doctorConsultation,
    } = this.state;

    return (
      <div className="container-fluid custom-container">
        <div className="row">
          <div className="col-12 form-card">
            <h6>Patient Id:</h6> {patient_address} <br />
            <h6>Patient name:</h6> {patient_name} <br />
            <h6>Patient age:</h6> {patient_age}
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-4 form-card">
            <h5>Patient Files</h5>
            <div className="content-card">
              {files.map((fhash, i) => (
                <DisplayFiles key={i} props={fhash} that={this} />
              ))}
            </div>
          </div>

          <div className="col-4 form-card">
            <h5>Doctor Consultations</h5>
            <div className="content-card">
              {doctorConsultation.map((doc, i) => {
                const {
                  doctor_id,
                  consultation_advice,
                  medicine,
                  time_period,
                } = doc;
                return (
                  <DisplayConsultation
                    key={i}
                    that={this}
                    props={{
                      doctor_id,
                      consultation_advice,
                      medicine,
                      time_period,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="col-4 form-card">
            <h5>Doctor Added Files</h5>
            <div className="content-card">
              {doctorAddedFiles.map((fhash, i) => (
                <DisplayFiles key={i} props={fhash} that={this} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}




export default DisplayPatientToCompany;
