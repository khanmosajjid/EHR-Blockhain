import React, { Component } from 'react';
import {   Input,  message, Tag, Card, Collapse } from 'antd';
import healthRecord from "../contracts/DoctorAddRecord.json"
import getWeb3 from '../getWeb3';
import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
import axios from "axios";
import './css/patient.css'

import ipfs from "./ipfs-util"


class Patient extends Component {

    constructor(props){
        super(props);
        this.uploadFile = this.uploadFile.bind(this);
        this.getFile = this.getFile.bind(this);
        // this.addPatientToInsuranceComp = this.addPatientToInsuranceComp.bind(this);

    }

    contract =this.props.contract['OPT'];
    doctorAddRecord = this.props.contract['DAR'];
    accounts =this.props.Acc;

    state = {
        name: "",
        DOB: "",
        files: [],
        doctor_list: [],
        filesInfo:[],
        showPopup:[],
        doctorId: null,
        secret: null,
        visible: false,
        loaded:false,
        buffer:null,
        doctorConsultation:[],
        doctorAddedFiles:[],
        contact_info:"",
        file:null,
        hash:null
    }


    async loadcontract(){
        var web3 = await getWeb3();
        const networkId = await web3.eth.net.getId();
        var deployedNetwork = healthRecord.networks[networkId];

        this.doctorAddRecord = new web3.eth.Contract(
            healthRecord.abi,
            deployedNetwork && deployedNetwork.address,
          );

          console.log("contract loaded")
    }



    
      
    componentDidMount(){ 
        
        this.loadPatient();    
    }



    async loadFiles(){
        const files = await this.contract.methods.getUserFiles(this.accounts[0]).call({from:this.accounts[0]});
        console.log('files',files);
        if(files[0])
        this.setState({files:files});

    }
    async loadPatient (){
        let res = await this.contract.methods.getPatientInfo().call({from :this.accounts[0]});

        this.setState({name:res[0],DOB:res[2],files:res[3],doctor_list:res[4], contact_info:res[6]},
        () => {
            this.loadFiles();
            this.loadcontract();
            this.loadDoctorAddedFiles();
            this.loadDoctorConsultation();
            
        
        });
      
    }

    async loadDoctorConsultation(){
        const data = await this.doctorAddRecord.methods.getDoctorConsultationForPatient().call({from:this.accounts[0]});
        
        if(data)
            this.setState({doctorConsultation:data});

        console.log('doctor consultation', this.state.doctorConsultation);
            
    }

    async loadDoctorAddedFiles(){
        try{
        const data = await this.doctorAddRecord.methods.getDoctorAddedFiles(this.accounts[0]).call({from:this.accounts[0]});
        if(data)
        this.setState({doctorAddedFiles: data});

        console.log('doctor added files',this.state.doctorAddedFiles);
        }
        catch(e){
            console.log(e);
        }
    }

    async grantAccess(){
        
        
        if(this.state.doctorId){
            let res = await this.contract.methods.grantAccessToDoctor(this.state.doctorId)
            .send({"from":this.accounts[0]});
            
            if(res) {
                message.success('access successful');
                console.log("access successful")
                this.setState({doctorId:null});
            }
        }
    }

    
    async revokeAccess(){
        
        
        if(this.state.doctorId){
            let res = await this.contract.methods.revokeAccessFromDoctor(this.state.doctorId)
            .send({"from":this.accounts[0]});
            
            if(res) {
                message.success('access revoked');
                console.log("access revoked")
                this.setState({doctorId:null});
            }
        }
    }

    onTextChange(type, e){
        if(e && e.target)
            this.setState({[type]:e.target.value});
    }

    
    updateFileHash = async (name,type,ipfshash) => {
        
        //sending transaction and storing result to state variables
          
         let res = await this.contract.methods.addUserFiles(name,type,ipfshash).send({"from":this.accounts[0]});
             console.log(res);
         if(res)
             console.log("file upload successful");
         else
             console.log("file upload unsuccessful");
     }

  
  
    async uploadFile(event)
    {
        event.preventDefault();
        	if (!this.state.file) {
			console.error('No file selected.');
			return;
		}

		const formData = new FormData();
		formData.append('file', this.state.file);

		try {

			const response = await axios.post(
				'https://api.pinata.cloud/pinning/pinFileToIPFS',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						pinata_api_key: 'e56a0d10deca898a1f17',
						pinata_secret_api_key: 'a98f71ff3eb345a0545e536c946cc0c297ddf2a1b00e83e4eb8f81f50226311f',
					},
				}
			);

			console.log('File uploaded to IPFS:', response.data);
	
      this.updateFileHash(this.state.file.name,this.state.file.type,response?.data?.IpfsHash)
	
		} catch (error) {
			console.error('Error uploading file:', error);
		}

        // ipfs.files.add(this.state.buffer,(err,res)=>{
        //     if(err){
        //         console.error(err)
        //         return 
        //     }
            
        //    this.updateFileHash(this.state.file.name,this.state.file.type,res[0].hash)
        // })
    }
    getFile(event)
    {
        event.preventDefault();
        console.log("getfile");
        const file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend =() =>{
            this.setState({buffer:Buffer(reader.result),file});
            console.log('buffer',file);
        }
    } 
    
    showFile(hash) {
        let { files, doctorAddedFiles} = this.state;
        if(files.indexOf(hash) > -1 || doctorAddedFiles.indexOf(hash)>-1){
            let path=`https://ipfs.io/ipfs/${hash[2]}`
            console.log(path);
            window.open(path);
        }
    }

    
    // async addPatientToInsuranceComp(event){
    //     event.preventDefault();
    //     let addr1= document.getElementById('added_patient').value;
    //     let addr2= document.getElementById('added_to_company').value;
    //     try{
    //         let result = await this.contract.methods.addPatientToInsuranceComp(addr2,addr1).send({"from":this.accounts[0]});
    //         console.log(result);
    //     }
    //     catch(e){
    //         console.log(e);
    //     }
    // }

    render() {
        let { name, DOB, files, doctor_list, doctorConsultation, doctorAddedFiles, contact_info } = this.state;
        
        return (
          <div className="container">
            {/* Patient Details Card */}
            <div className="mt-3 header-card">
              <div className="userDetails">
                <h4>Patient Details</h4>
                <span>
                  <b>Name:</b> {name}
                </span>{" "}
                <br />
                <span>
                  <b>DOB:</b> {DOB}
                </span>{" "}
                <br />
                <span>
                  <b>Contact Info:</b> {contact_info}
                </span>
              </div>
            </div>

            {/* Grant and Revoke Access Row */}
            <div className="row mt-3">
              <div className="col-md-6 form-card">
                <h6>Grant Access</h6>
                <div className="card-content">
                  <input
                    className="form-control"
                    value={this.state.doctorId}
                    onChange={this.onTextChange.bind(this, "doctorId")}
                    placeholder="Grant Address"
                  />
                  <button
                    className="btn btn-dark btn-block"
                    onClick={this.grantAccess.bind(this)}
                  >
                    Grant Access
                  </button>
                </div>
              </div>
              <div className="col-md-6 form-card">
                <h6>Revoke Access</h6>
                <div className="card-content">
                  <input
                    className="form-control"
                    value={this.state.doctorId}
                    onChange={this.onTextChange.bind(this, "doctorId")}
                    placeholder="Revoke Address"
                  />
                  <button
                    className="btn btn-dark btn-block"
                    onClick={this.revokeAccess.bind(this)}
                  >
                    Revoke Access
                  </button>
                </div>
              </div>
            </div>

            {/* Upload File and Your Files Row */}
            <div className="row mt-3">
              <div className="col-md-6 form-card">
                <h6>Upload Filessss</h6>
                <form
                  onSubmit={this.uploadFile.bind(this)}
                  className="card-content"
                >
                  <input
                    type="file"
                    accept="application/pdf, image/*"
                    onChange={this.getFile.bind(this)}
                    className="form-control"
                  />
                  <button type="submit" className="btn btn-dark btn-block">
                    Upload
                  </button>
                </form>
              </div>
              <div className="col-md-6 form-card">
                <h6>Your Files</h6>
                <div className="card-content">
                  {/* Iterate over files */}
                  {files.map((fhash, i) => (
                    <DisplayFiles key={i} that={this} props={fhash} />
                  ))}
                </div>
              </div>
            </div>

            {/* Doctor List and Consultations Row */}
            <div className="row mt-3">
              <div className="col-md-6 form-card">
                <h6>Doctor List</h6>
                <div className="card-content">
                  {doctor_list.map((doctor, i) => (
                    <div key={i}>{doctor}</div> // Using div for simplicity, adjust as needed
                  ))}
                </div>
              </div>
              <div className="col-md-6 form-card">
                <h6>Doctor Consultations</h6>
                <div className="card-content">
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
            </div>

            {/* Doctor Added Files */}
            <div className="row mt-3">
              <div className="col form-card">
                <h6>Doctor Added Files</h6>
                <div className="card-content">
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

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}


export default Patient;

