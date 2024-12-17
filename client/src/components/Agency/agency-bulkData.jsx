import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MyDentityLogo from '../../assets/MyDentityLogo.png';
import MyDentityContract from '../../contracts/MyDentity.json';
import { ethers } from "ethers";
import Papa from 'papaparse';
import { CONTRACT_ADDRESS } from '../../contracts/contract.js';

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 80vh;
  min-width: 70vw;
  background-color: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

// Sidebar styling
const Sidebar = styled.div`
  width: 250px;
  background-color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

// Logo styling
const Logo = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

// Menu section styling
const MenuSection = styled.div`
  margin-bottom: 20px;
`;

const MenuItem = styled.div`
  display: flex;
  padding: 14px;
  cursor: pointer;
  color: ${props => (props.active ? '#ffcc33' : 'black')};
  background-color: ${props => (props.active ? 'rgba(255, 204, 51, 0.2)' : 'transparent')};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 204, 51, 0.2);
    color: #ffcc33;
    transform: translateX(5px);
  }
`;


const MainContent = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
  max-height: 90vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: white;
  padding: 25px;
  padding-left: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background-color: #c82333;
  }
`;

const UserInfo = styled.div`
  text-align: left;
  flex: 1;
  padding-left: 20px;

  h3 {
    margin: 0;
    font-size: 24px;
    color: #2c2c2c;
    font-weight: bold;
    margin-bottom: 8px;
    
    span {
      color: #ffcc33;
      font-weight: 700;
    }
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    font-weight: bold;
  }
`;

const PageDescription = styled.div`
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  position: relative;
  text-align: center;
  margin: auto;
  width: 90%;
  }
`;

const DescriptionTitle = styled.h2`
  color: #2c2c2c;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 40px;
    margin-top: 1px;
    position: relative;
    display: inline-block;

  &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 3px;
      background: #ffcc33;
      border-radius: 2px;
    }

  &::before {
    content: '📥';
    font-size: 24px;
  }
`;

const CategoryTitle = styled.h2`
color: #2c2c2c;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 40px;
    margin-top: 1px;
    position: relative;
    display: inline-block;
`;

const DescriptionText = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const MainContainer = styled.div`
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  margin-bottom: 2%;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding: 10px;
  position: relative;
  background: #eee;
`;

const InputField = styled.input`
  width: 80%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  letter-spacing: 2px;
  background-color: #d9d1d0;
  color: grey;
  padding-right: 50px;
  text-align: center;
`;

const SelectField = styled.select`
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  letter-spacing: 2px;
  background-color: #d9d1d0;
  color: grey;
  text-align: center;
  cursor: pointer;
`;

const Label = styled.div`
  font-weight: bold;
  color: #757474;
  padding: 20px;
`;


const SectionTitle = styled.div`
  color: #666;
  font-size: 24px;
  font-weight: bold;
  margin: 30px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #ffcc33;
  width: 25%;
`;

const StoreButton = styled.button`
  width: 30%;
  background-color: #ffcc33;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #e6b800;
  }
`;

const EyeIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 5vw;
  transform: translateY(-50%);
  cursor: pointer;
`;

const UploadContainer = styled.div`
  width: 90%;
  background-color: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 1% 5% 2% 5%;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const UploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  color: grey;

  &:hover {
    background: rgba(44, 44, 44, 0.9);
    transform: translateY(-2px);
    color: #ffcc33;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #2c2c2c;
  color: #ffcc33;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  border-radius: 8px;
  margin-top: 20px;

  &:hover {
    background: #ffcc33;
    color: #2c2c2c;
  }

  &:disabled {
    background-color: #666;
    color: #999;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 30px;
  background: #ddd;
  color: black;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  &:hover {
    background: rgba(44, 44, 44, 0.9);
    transform: translateY(-2px);
    color: #ffcc33;
  }
`;

const Title = styled.div`
  color: #2c2c2c;
  font-size: 24px;
  font-weight: bold;
  margin: 25px 0;
  letter-spacing: 0.5px;
`;

const FileInfo = styled.div`
  background: rgba(255, 204, 51, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;

  p {
    margin: 5px 0;
    font-size: 14px;
    font-weight: 500;
  }
`;

const UploadMessage = styled.div`
  p {
    margin: 10px 0;
    font-size: 16px;
    font-weight: 500;
  }

  p:first-child {
    font-size: 18px;
    margin-bottom: 15px;
  }
`;

const GuideSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;


const AgencyBulkData = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    ID: localStorage.getItem("ID") || "",
    agencyName: localStorage.getItem("agencyName") || "",
    agencyContact: localStorage.getItem("agencyContact") || "",
  });
  
  const [formData, setFormData] = useState({
    // Personal Data
    ic: '',
    fullName: '',
    gender: '',
    DOB: '',
    // Address
    homeAddress: '',
    state: '',
    city: '',
    zipCode: '',
    // Education
    educationLevel: '',
    graduationYear: '',
    institution: '',
    // Occupation
    occupation: '',
    employer: '',
    yearsOfExperience: '',
    // Income
    incomeSource: '',
    incomeFrequency: '',
    incomeAmount: '',
    incomeNotes: '',
    // Household
    householdSize: '',
    householdIncome: '',
    dependents: '',
    // Commitment
    commitmentType: '',
    commitmentDetails: '',
    commitmentAmount: '',
    // Relief
    reliefType: '',
    reliefDetails: '',
    reliefAmount: '',
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            MyDentityContract.abi,
            signer
        );

        const baseYear = 1900;
        const baseYearTimestamp = Math.floor(new Date(`${baseYear}-01-01T00:00:00Z`).getTime() / 1000);
        const CaldobTimestamp = Math.floor(new Date(formData.DOB).getTime() / 1000);
        const dobTimestamp = CaldobTimestamp - baseYearTimestamp;
        const password = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
        const agencyName = localStorage.getItem("agencyName");

        // Check if user is registered
        const [ic, role, registered, currentVersion, dataVersions] = await contract.getUserDetails(formData.ic);

        console.log(registered);
        if (registered) {
            // Use storeUserData for registered users
            const tx = await contract.storeUserData(
                formData.ic,
                formData.fullName,
                formData.gender,
                dobTimestamp,
                password,
                formData.homeAddress,
                formData.state,
                formData.city,
                formData.zipCode,
                formData.educationLevel,
                parseInt(formData.graduationYear),
                formData.institution,
                parseInt(formData.householdSize),
                parseInt(formData.householdIncome),
                parseInt(formData.dependents),
                formData.incomeSource,
                formData.incomeFrequency,
                parseInt(formData.incomeAmount),
                formData.incomeNotes,
                formData.occupation,
                formData.employer,
                parseInt(formData.yearsOfExperience),
                formData.commitmentType,
                formData.commitmentDetails,
                parseInt(formData.commitmentAmount),
                formData.reliefType,
                formData.reliefDetails,
                parseInt(formData.reliefAmount),
                true, // _isAgency
                agencyName,
            );

            await tx.wait();
            alert("Data updated successfully for " + formData.fullName + "!");
        } else {
            // Use TempStoreUserData for unregistered users
            const personalInfo = await contract.createTempPersonalInfo(
                formData.fullName,
                formData.gender,
                dobTimestamp,
                password
            );

            const addressInfo = await contract.createTempAddressInfo(
                formData.homeAddress,
                formData.state,
                formData.city,
                formData.zipCode
            );

            const educationInfo = await contract.createTempEducationInfo(
                formData.educationLevel,
                parseInt(formData.graduationYear),
                formData.institution
            );

            const financialInfo = await contract.createTempFinancialInfo(
                parseInt(formData.householdSize),
                parseInt(formData.householdIncome),
                parseInt(formData.dependents),
                formData.incomeSource,
                formData.incomeFrequency,
                parseInt(formData.incomeAmount),
                formData.incomeNotes
            );

            const employmentInfo = await contract.createTempEmploymentInfo(
                formData.occupation,
                formData.employer,
                parseInt(formData.yearsOfExperience)
            );

            const commitmentInfo = await contract.createTempCommitmentInfo(
                formData.commitmentType,
                formData.commitmentDetails,
                parseInt(formData.commitmentAmount)
            );

            const reliefInfo = await contract.createTempReliefInfo(
                formData.reliefType,
                formData.reliefDetails,
                parseInt(formData.reliefAmount)
            );

            const tx = await contract.TempStoreUserData(
                formData.ic,
                personalInfo,
                addressInfo,
                educationInfo,
                financialInfo,
                employmentInfo,
                commitmentInfo,
                reliefInfo,
                agencyName
            );

            await tx.wait();
            alert("User has not registered yet. Temporary data stored successfully for " + formData.fullName + "!");
        }
        
        setIsLoading(false);
        navigate('/agency-dashboard');
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("An error occurred while saving the data.");
        setIsLoading(false);
    }
};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("Parsed CSV data:", results.data);
          setUploadedData(results.data);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          alert("Error parsing CSV file. Please check the format.");
        }
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("Parsed CSV data:", results.data);
          setUploadedData(results.data);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          alert("Error parsing CSV file. Please check the format.");
        }
      });
    } else {
      alert("Please upload a CSV file");
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
        alert("Please select a CSV file first");
        return;
    }

    setIsLoading(true);

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            MyDentityContract.abi,
            signer
        );

        for (const row of uploadedData) {
            try {
                const baseYear = 1900;
                const baseYearTimestamp = Math.floor(new Date(`${baseYear}-01-01T00:00:00Z`).getTime() / 1000);
                const CaldobTimestamp = Math.floor(new Date(row.DOB).getTime() / 1000);
                const dobTimestamp = CaldobTimestamp - baseYearTimestamp;
                const password = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
                const agencyName = localStorage.getItem("agencyName");

                // Check if user is registered
                const [IC, role, registered, currentVersion, dataVersions] = await contract.getUserDetails(row.ic);

                if (registered) {
                    // Use storeUserData for registered users
                    const tx = await contract.storeUserData(
                        row.ic,
                        row.fullName || "",
                        row.gender || "",
                        dobTimestamp,
                        password,
                        row.homeAddress || "",
                        row.state || "",
                        row.city || "",
                        row.zipCode || "",
                        row.educationLevel || "",
                        parseInt(row.graduationYear) || 0,
                        row.institution || "",
                        parseInt(row.householdSize) || 0,
                        parseInt(row.householdIncome) || 0,
                        parseInt(row.dependents) || 0,
                        row.incomeSource || "",
                        row.incomeFrequency || "",
                        parseInt(row.incomeAmount) || 0,
                        row.incomeNotes || "",
                        row.occupation || "",
                        row.employer || "",
                        parseInt(row.yearsOfExperience) || 0,
                        row.commitmentType || "",
                        row.commitmentDetails || "",
                        parseInt(row.commitmentAmount) || 0,
                        row.reliefType || "",
                        row.reliefDetails || "",
                        parseInt(row.reliefAmount) || 0,
                        true, // _isAgency
                        agencyName
                    );

                    await tx.wait();
                    console.log(`Successfully updated data for registered user: ${row.fullName}`);
                } else {
                    // Use TempStoreUserData for unregistered users
                    const personalInfo = await contract.createTempPersonalInfo(
                        row.fullName || "",
                        row.gender || "",
                        dobTimestamp,
                        password
                    );

                    const addressInfo = await contract.createTempAddressInfo(
                        row.homeAddress || "",
                        row.state || "",
                        row.city || "",
                        row.zipCode || ""
                    );

                    const educationInfo = await contract.createTempEducationInfo(
                        row.educationLevel || "",
                        parseInt(row.graduationYear) || 0,
                        row.institution || ""
                    );

                    const financialInfo = await contract.createTempFinancialInfo(
                        parseInt(row.householdSize) || 0,
                        parseInt(row.householdIncome) || 0,
                        parseInt(row.dependents) || 0,
                        row.incomeSource || "",
                        row.incomeFrequency || "",
                        parseInt(row.incomeAmount) || 0,
                        row.incomeNotes || ""
                    );

                    const employmentInfo = await contract.createTempEmploymentInfo(
                        row.occupation || "",
                        row.employer || "",
                        parseInt(row.yearsOfExperience) || 0
                    );

                    const commitmentInfo = await contract.createTempCommitmentInfo(
                        row.commitmentType || "",
                        row.commitmentDetails || "",
                        parseInt(row.commitmentAmount) || 0
                    );

                    const reliefInfo = await contract.createTempReliefInfo(
                        row.reliefType || "",
                        row.reliefDetails || "",
                        parseInt(row.reliefAmount) || 0
                    );

                    const tx = await contract.TempStoreUserData(
                        row.ic,
                        personalInfo,
                        addressInfo,
                        educationInfo,
                        financialInfo,
                        employmentInfo,
                        commitmentInfo,
                        reliefInfo,
                        agencyName
                    );

                    await tx.wait();
                    console.log(`Successfully stored temporary data for unregistered user: ${row.fullName}`);
                }

            } catch (error) {
                console.error(`Error processing data for user: ${row.fullName}`, error);
            }
        }

        alert("Bulk upload completed successfully!");
        setCsvFile(null);
        setUploadedData([]);

    } catch (error) {
        console.error("Bulk upload error:", error);
        alert("Error during bulk upload. Please check the console for details.");
    } finally {
        setIsLoading(false);
    }
};

  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem onClick={() => navigate('/agency-dashboard')}>
            ✍️ VIEW CITIZEN DATA
          </MenuItem>
          <MenuItem active onClick={() => navigate('/agency-bulkData')}>
            📂 BULK DATA
          </MenuItem>
        </MenuSection>
      </Sidebar>

      <MainContent>
        <Header>
          <UserInfo>
            <h3>Welcome, <span>{userInfo.agencyName}</span></h3>
            <p>Agency ID: {userInfo.ID}</p>
          </UserInfo>
          <LogoutButton onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            LOG OUT
          </LogoutButton>
        </Header>
        <MainContainer>
          <PageDescription>
            <DescriptionTitle>Bulk Data Management</DescriptionTitle>
            <DescriptionText>
              Efficiently manage multiple citizen records through our bulk data tools. You can either 
              input individual user data manually or upload a CSV file containing multiple records. 
              The system supports comprehensive data entry including personal information, education, 
              income, and more. Ensure all required fields are filled correctly for successful submission.
            </DescriptionText>
          </PageDescription>

          <ToggleButton onClick={() => setIsFormExpanded(!isFormExpanded)}>
            <span>Single User Data Entry</span>
            <span>{isFormExpanded ? '▼' : '▲'}</span>
          </ToggleButton>
          
          {isFormExpanded && (
            <>
              <Title>Single Data Entry</Title>
              <SectionTitle>Personal Data</SectionTitle>
              <GridContainer>
                <Label>IC</Label>
                <InputField
                  type="text"
                  placeholder="Enter IC"
                  name="ic"
                  value={formData.ic}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>FULL NAME</Label>
                <InputField
                  type="text"
                  placeholder="Enter Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>GENDER</Label>
                <SelectField
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>D.O.B</Label>
                <InputField
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              {/* Address Section */}
              <SectionTitle>Address</SectionTitle>
              <GridContainer>
                <Label>ADDRESS</Label>
                <InputField
                  type="text"
                  placeholder="Enter Address"
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>STATE</Label>
                <SelectField
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select State</option>
                  <option value="Johor">Johor</option>
                  <option value="Kedah">Kedah</option>
                  <option value="Kelantan">Kelantan</option>
                  <option value="Melaka">Melaka</option>
                  <option value="Negeri Sembilan">Negeri Sembilan</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Penang">Penang</option>
                  <option value="Perak">Perak</option>
                  <option value="Perlis">Perlis</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Terengganu">Terengganu</option>
                  <option value="W.P Kuala Lumpur">W.P Kuala Lumpur</option>
                  <option value="W.P Labuan">W.P Labuan</option>
                  <option value="W.P Putrajaya">W.P Putrajaya</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>CITY</Label>
                <InputField
                  type="text"
                  placeholder="Enter City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>ZIP CODE</Label>
                <InputField
                  type="text"
                  placeholder="Enter Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              {/* Education Section */}
              <SectionTitle>Education</SectionTitle>
              <GridContainer>
                <Label>EDUCATION LEVEL</Label>
                <SelectField
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Education Level</option>
                  <option value="Primary School">Primary School</option>
                  <option value="Secondary School">Secondary School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>GRADUATION YEAR</Label>
                <InputField
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  placeholder="Enter Graduation Year"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>INSTITUTION</Label>
                <InputField
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="Enter Institution Name"
                  required
                />
              </GridContainer>

              {/* Occupation Section */}
              <SectionTitle>Occupation</SectionTitle>
              <GridContainer>
                <Label>OCCUPATION</Label>
                <InputField
                  type="text"
                  placeholder="Enter Your Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>EMPLOYER</Label>
                <InputField
                  type="text"
                  placeholder="Enter Employer Name"
                  name="employer"
                  value={formData.employer}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>YEARS OF EXPERIENCE</Label>
                <InputField
                  type="number"
                  placeholder="Enter Years of Experience"
                  min="0"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              {/* Income Section */}
              <SectionTitle>Income</SectionTitle>
              <GridContainer>
                <Label>SOURCE OF INCOME</Label>
                <SelectField
                  name="incomeSource"
                  value={formData.incomeSource}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Source</option>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Investment">Investment</option>
                  <option value="Pension">Pension</option>
                  <option value="Others">Others</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>FREQUENCY OF INCOME</Label>
                <SelectField
                  name="incomeFrequency"
                  value={formData.incomeFrequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                  <option value="One-Time">One-Time</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>INCOME</Label>
                <InputField
                  type="number"
                  placeholder="Income RM"
                  min="0"
                  name="incomeAmount"
                  value={formData.incomeAmount}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>NOTES (OPTIONAL)</Label>
                <InputField
                  type="text"
                  name="incomeNotes"
                  value={formData.incomeNotes}
                  onChange={handleInputChange}
                  placeholder="Additional income details"
                />
              </GridContainer>

              {/* Household Section */}
              <SectionTitle>Household</SectionTitle>
              <GridContainer>
                <Label>HOUSEHOLD SIZE</Label>
                <InputField
                  type="number"
                  placeholder="Enter Household Size"
                  name="householdSize"
                  value={formData.householdSize}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>HOUSEHOLD INCOME (MONTHLY)</Label>
                <InputField
                  type="number"
                  placeholder="Enter Monthly Income (RM)"
                  name="householdIncome"
                  value={formData.householdIncome}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>DEPENDENTS</Label>
                <InputField
                  type="number"
                  placeholder="Enter Number of Dependents"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </GridContainer>

              {/* Commitment Section */}
              <SectionTitle>Commitment</SectionTitle>
              <GridContainer>
                <Label>COMMITMENT TYPE</Label>
                <SelectField
                  name="commitmentType"
                  value={formData.commitmentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Commitment Type</option>
                  <option value="Loan">Loan</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Others">Others</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>COMMITMENT DETAILS</Label>
                <InputField
                  type="text"
                  placeholder="e.g., Bank Name, Account No."
                  name="commitmentDetails"
                  value={formData.commitmentDetails}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>COMMITMENT AMOUNT (MONTHLY)</Label>
                <InputField
                  type="number"
                  placeholder="Enter Monthly Amount (RM)"
                  min="0"
                  name="commitmentAmount"
                  value={formData.commitmentAmount}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              {/* Relief Section */}
              <SectionTitle>Relief</SectionTitle>
              <GridContainer>
                <Label>RELIEF TYPE</Label>
                <SelectField
                  name="reliefType"
                  value={formData.reliefType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Relief Type</option>
                  <option value="Tax Relief">Tax Relief</option>
                  <option value="Medical Relief">Medical Relief</option>
                  <option value="Education Relief">Education Relief</option>
                  <option value="Charitable Donation">Charitable Donation</option>
                  <option value="Others">Others</option>
                </SelectField>
              </GridContainer>

              <GridContainer>
                <Label>RELIEF DETAILS</Label>
                <InputField
                  type="text"
                  placeholder="e.g., Description or Provider"
                  name="reliefDetails"
                  value={formData.reliefDetails}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <GridContainer>
                <Label>RELIEF AMOUNT</Label>
                <InputField
                  type="number"
                  placeholder="Enter Amount (RM)"
                  min="0"
                  name="reliefAmount"
                  value={formData.reliefAmount}
                  onChange={handleInputChange}
                  required
                />
              </GridContainer>

              <StoreButton onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Store"}
              </StoreButton>
            </>
          )}
        </MainContainer>

        <UploadContainer>
          <Title>Bulk Data Upload</Title>
          <UploadArea
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csvFile').click()}
          >
            <FileInput
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
            {csvFile ? (
              <FileInfo>
                <p>Selected file: {csvFile.name}</p>
                <p>Number of records: {uploadedData.length}</p>
              </FileInfo>
            ) : (
              <UploadMessage>
                <p>📄 Upload CSV File</p>
                <p>Drag and drop your file here or click to browse files</p>
              </UploadMessage>
            )}
          </UploadArea>
          
          {csvFile && (
            <UploadButton
              onClick={handleBulkUpload}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Bulk Data'}
            </UploadButton>
          )}
        </UploadContainer>
      </MainContent>
    </Container>
  );
};

export default AgencyBulkData; 