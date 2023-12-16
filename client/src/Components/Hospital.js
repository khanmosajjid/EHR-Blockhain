import React, { Component } from "react";
import { Card } from "antd";
import { Button } from "react-bootstrap";
import "./css/DocLogin.css";
// import healthRecord from "../contracts/DoctorAddRecord.json"
// import getWeb3 from '../getWeb3';

class Hospital extends Component {
  constructor(props) {
    super(props);
    this.grantAccess = this.grantAccess.bind(this);
    this.addPatientToInsuranceComp = this.addPatientToInsuranceComp.bind(this);
    this.registerDoc = this.registerDoc.bind(this);
  }

  contract = this.props.contract["OPT"];
  doctorAddRecord = this.props.contract["DAR"];
  accounts = this.props.Acc;

  state = {
    hosp_name: "",
    hosp_location: "",
    hosp_id: "",
  };
  //async methods and states here
  async loadHospital() {
    try {
      let res = await this.contract.methods
        .getHospitalInfo()
        .call({ from: this.accounts[0] });
      this.setState({
        hosp_id: res[0],
        hosp_name: res[1],
        hosp_location: res[2],
      });
    } catch (e) {
      console.log(e);
    }
  }

  async grantAccess(event) {
    event.preventDefault();
    let requestor = document.getElementById("access_requestor").value;
    let patient = document.getElementById("access_of").value;
    console.log(requestor);
    console.log(patient);
    try {
      let result = await this.contract.methods
        .hospitalGrantAccess(requestor, patient)
        .send({ from: this.accounts[0] });
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  componentDidMount() {
    this.loadHospital();
  }

  async addPatientToInsuranceComp(event) {
    event.preventDefault();
    let addr1 = document.getElementById("added_patient").value;
    let addr2 = document.getElementById("added_to_company").value;
    try {
      let result = await this.contract.methods
        .addPatientToInsuranceComp(addr2, addr1)
        .send({ from: this.accounts[0] });
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  async registerDoc(event) {
    event.preventDefault(true);
    let name = document.getElementById("doc_name").value;
    let id = document.getElementById("doc_id").value;
    let contact_info = document.getElementById("doc_contact").value;
    let specialization = document.getElementById("doc_specs").value;

    console.log(name);
    console.log(id);
    console.log(contact_info);
    console.log(specialization);

    await this.contract.methods
      .signupDoctor(id, name, contact_info, specialization)
      .send({ from: this.accounts[0] });
  }
  render() {
    let { hosp_name, hosp_id, hosp_location } = this.state;

    return (
      <div className="container">
        {/* Hospital Information Header Card */}
        <div className="row">
          <div className="col-12">
            <div className="header-card mb-4">
              <div>
                <span>
                  <b>Id:</b> {hosp_id}
                </span>
                <br />
                <span>
                  <b>Name:</b> {hosp_name}
                </span>
                <br />
                <span>
                  <b>Location:</b> {hosp_location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Row */}
        <div className="row justify-content-center">
          {/* Grant Access Form */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4 className="form-title">Grant patient access to doctor</h4>
              <form onSubmit={this.grantAccess}>
                <div className="form-group">
                  <label>
                    <b>Grant access to</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="access_requestor"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Access of:</b>
                  </label>
                  <input type="text" className="form-control" id="access_of" />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Grant Access
                </button>
              </form>
            </div>
          </div>

          {/* Add Patient to Insurance Form */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4 className="form-title">Add Patient To Insurance Comp.</h4>
              <form onSubmit={this.addPatientToInsuranceComp}>
                <div className="form-group">
                  <label>Patient Address:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="added_patient"
                    placeholder="Patient address"
                  />
                </div>
                <div className="form-group">
                  <label>Company Address:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="added_to_company"
                    placeholder="Company Address"
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Add Doctor to Blockchain Form */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4 className="form-title">Add Doctor To Blockchain</h4>
              <form onSubmit={this.registerDoc}>
                <div className="form-group">
                  <label>
                    <b>Name:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="doc_name"
                    placeholder="Name"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Blockchain Address:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="doc_id"
                    placeholder="Address"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Contact Info:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="doc_contact"
                    placeholder="Contact Info"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Specialization:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="doc_specs"
                    placeholder="Specialization"
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Register Doctor
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Hospital;
