import React, { Component } from "react";
import { Input, message, Tag, Card, Collapse } from "antd";
import { Button } from "react-bootstrap";

// import healthRecord from "../contracts/DoctorAddRecord.json"
// import getWeb3 from '../getWeb3';

class Owner extends Component {
  constructor(props) {
    super(props);
    this.registerHospital = this.registerHospital.bind(this);
    this.addInsuranceComp = this.addInsuranceComp.bind(this);
    this.addUserByAdhaar = this.addUserByAdhaar.bind(this);
  }

  //async methods and states here
  contract = this.props.contract["OPT"];
  doctorAddRecord = this.props.contract["DAR"];
  accounts = this.props.Acc;

  async registerHospital(event) {
    event.preventDefault();
    let id = document.getElementById("hosp_id").value;
    let name = document.getElementById("hosp_name").value;
    let location = document.getElementById("hosp_location").value;
    console.log(name);
    console.log(id);
    console.log(location);
    try {
      let result = await this.contract.methods
        .addHospital(id, name, location)
        .send({ from: this.accounts[0] });
      console.log("result of add hospital is---->", result);
      if (result?.status) {
        alert("hospital added successfully");
      }

      console.log(result);
    } catch (e) {
      console.log(e);
      alert("something went wrong");
    }
  }

  async addInsuranceComp(event) {
    event.preventDefault();
    let id = document.getElementById("company_id").value;
    let name = document.getElementById("company_name").value;
    console.log(id);
    console.log(name);
    try {
      let result = await this.contract.methods
        .regInsuranceComp(id, name)
        .send({ from: this.accounts[0] });
      if (result?.status) {
        alert("Insurance company added successfully");
      }
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  async addUserByAdhaar(event) {
    event.preventDefault();
    var result = null;
    try {
      let user_type = document.getElementById("adhaar_user_type").value;
      let user_name = document.getElementById("user_name").value;
      let adhaar_blockchain_id = document.getElementById(
        "adhaar_blockchain_id"
      ).value;
      let adhaar_number = document.getElementById("adhaar_number").value;
      let dob = document.getElementById("dob").value;
      let pincode = document.getElementById("pincode").value;

      console.log(pincode);

      if (user_type == "patient") {
        result = await this.contract.methods
          .addPatientAdhaarInfo(
            adhaar_blockchain_id,
            user_name,
            dob,
            pincode,
            adhaar_number
          )
          .send({ from: this.accounts[0] });
        if (result?.status) {
          alert("User Added successfully");
        }
      } else {
        result = await this.contract.methods
          .addDoctorAdhaarInfo(
            adhaar_blockchain_id,
            user_name,
            dob,
            pincode,
            adhaar_number
          )
          .send({ from: this.accounts[0] });
      }
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          {/* Create Hospital Card */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4>Create Hospital</h4>
              <form onSubmit={this.registerHospital}>
                <div className="form-group">
                  <label>
                    <b>Blockchain Address:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="hosp_id"
                    placeholder="Id"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Name:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="hosp_name"
                    placeholder="Name"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <b>Location:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="hosp_location"
                    placeholder="Location"
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Register Hospital
                </button>
              </form>
            </div>
          </div>

          {/* Add Insurance Company Card */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4>Add Insurance Comp.</h4>
              <form onSubmit={this.addInsuranceComp}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company_name"
                    placeholder="Name"
                  />
                </div>
                <div className="form-group">
                  <label>Blockchain Address:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company_id"
                    placeholder="Id"
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Add User by Aadhaar Card */}
          <div className="col-md-4 mt-2">
            <div className="form-card">
              <h4>Add User by Aadhaar</h4>
              <form onSubmit={this.addUserByAdhaar}>
                <div className="form-group">
                  <label>User Type:</label>
                  <select className="form-control" id="adhaar_user_type">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="user_name"
                    placeholder="Name"
                  />
                </div>
                <div className="form-group">
                  <label>Blockchain Address:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="adhaar_blockchain_id"
                    placeholder="Blockchain Id"
                  />
                </div>
                <div className="form-group">
                  <label>Aadhaar Number:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="adhaar_number"
                    placeholder="Aadhaar"
                  />
                </div>
                <div className="form-group">
                  <label>DOB:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="dob"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="form-group">
                  <label>Pincode:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    placeholder="Pincode"
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-block">
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Owner;
