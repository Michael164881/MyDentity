import { useState } from 'react';
import { ethers } from "ethers";
import './App.css';
import styled from "styled-components";
import MyDentityContract from './contracts/MyDentity.json';
import { CONTRACT_ADDRESS } from './contracts/contract.js';

const LoginBox = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 90%;
  text-align: center;
`;

const InputFieldContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputField = styled.input`
  width: 80%;
  padding: 10px;
  margin: 3% 2%;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  letter-spacing: 2px;
  background-color: #d9d1d0;
  color: grey;
  text-align: center;
`;

const LoginButton = styled.button`
  width: 60%;
  background-color: #ffcc33;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 40px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 30px;

  transition: transform 0.2s ease-in-out;

  &:hover{
    transform: translateY(-10%);
  }
`;

const DivisionField = styled.div`
  display: flex;
  justify-content: space-between;
  width: 86%;
  margin: auto;
`;

const EyeIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const SelectField = styled.select`
  width: 80%;
  padding: 10px;
  margin: 12px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #d9d1d0;
  color: grey;
  text-align: center;
  cursor: pointer;
`;

const App = () => {

  //show and hide password
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  //variable declaration
  const [fullName, setFullName] = useState('');
  const [ic, setIc] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const extractDOBFromIC = (ic) => {
    if (!ic || ic.length !== 12) return '';
  
    const year = ic.substring(0, 2);
    const month = ic.substring(2, 4);
    const day = ic.substring(4, 6);
  
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const previousCentury = currentCentury - 100;
  
    const fullYear = parseInt(year) > (currentYear % 100) 
      ? previousCentury + parseInt(year) 
      : currentCentury + parseInt(year);
  
    return `${fullYear}-${month}-${day}`;
  };
  
  const handleICChange = (e) => {
    const newIC = e.target.value;
    setIc(newIC);
  
    // Auto-fill DOB when IC is complete
    if (newIC.length === 12) {
      const extractedDOB = extractDOBFromIC(newIC);
      setDob(extractedDOB);
    }
  };

  const registerUser = async () => {
    // Input validation
    if (!fullName || !ic || !gender || !dob || !password) {
        alert("Please fill in all fields!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        // Check MetaMask
        if (typeof window.ethereum === "undefined") {
            throw new Error("MetaMask is not installed!");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        const userAddress = accounts[0];

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("Signer obtained");
  
        // Contract setup
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyDentityContract.abi,
          signer
        );

        try {
            const existingAddress = await contract.icToAddress(ic);
            if (existingAddress !== "0x0000000000000000000000000000000000000000") {
                alert("This IC is already registered. Please use a different IC.");
                return;
            }
        } catch (error) {
            console.log("Error checking IC status:", error);
        }

        // Hash password
        const passwordHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(password)
        );

        const baseYear = 1900;
        const baseYearTimestamp = Math.floor(new Date(`${baseYear}-01-01T00:00:00Z`).getTime() / 1000);

        const CaldobTimestamp = Math.floor(new Date(dob).getTime() / 1000);
        const dobTimestamp = CaldobTimestamp - baseYearTimestamp;
        
        console.log("Registering with data:", {
            address: userAddress,
            fullName,
            gender,
            ic,
            dob: dobTimestamp,
            role: "User"
        });

        // Send transaction
        const tx = await contract.registerUser(
            userAddress,
            ic,
            "User",
            {
                gasLimit: ethers.utils.hexlify(500000)
            }
        );

        const txUserData = await contract.storeUserDataRegister(
            ic,
            // Personal Data
            fullName,
            gender,
            dobTimestamp,
            //User Account
            passwordHash,
            // Address
            '',
            '',
            '',
            '',
            // Education (updated values)
            '',
            0,
            '',
            // Household
            0,
            0,
            0,
            // Income
            '',
            '',
            0,
            '',
            // Occupation
            '',
            '',
            0,
            // Commitment
            '',
            '',
            0,
            // Relief
            '',
            '',
            0,
            //Agency
            '',
            {
                gasLimit: ethers.utils.hexlify(1000000) 
            }
          );
  
        
        console.log("Transaction sent:", tx.hash);
        console.log("Transaction sent:", txUserData);
        console.log("Transaction sent:", tx);
        await tx.wait();
        await txUserData.wait();

        // Check for temporary data
        const hasTempData = await contract.hasTempUserData(ic);
        if (hasTempData) {
            // Get all version numbers
            const versions = await contract.getTempUserVersions(ic);
            console.log("Found temporary data versions:", versions);

            // Transfer each version to main storage
            for (const version of versions) {
                const tempData = await contract.getTempUserDataByVersion(ic, version);
                console.log(`Transferring version ${version} to main storage`);

                const tx = await contract.storeUserData(
                    ic,
                    tempData.personal.fullName,
                    tempData.personal.gender,
                    tempData.personal.DOB,
                    tempData.personal.passwordHash,
                    tempData.personalAddress.homeAddress,
                    tempData.personalAddress.state,
                    tempData.personalAddress.city,
                    tempData.personalAddress.zipCode,
                    tempData.education.educationLevel,
                    tempData.education.graduationYear,
                    tempData.education.institution,
                    tempData.financial.householdSize,
                    tempData.financial.householdIncome,
                    tempData.financial.dependents,
                    tempData.financial.incomeSource,
                    tempData.financial.incomeFrequency,
                    tempData.financial.incomeAmount,
                    tempData.financial.incomeNotes,
                    tempData.employment.occupation,
                    tempData.employment.employer,
                    tempData.employment.yearsOfExperience,
                    tempData.commitment.commitmentType,
                    tempData.commitment.commitmentDetails,
                    tempData.commitment.commitmentAmount,
                    tempData.relief.reliefType,
                    tempData.relief.reliefDetails,
                    tempData.relief.reliefAmount,
                    true, // _isAgency
                    tempData.agencyName
                );

                await tx.wait();
                console.log(`Successfully transferred version ${version}`);
            }

            // Clear temporary data after successful transfer
            await contract.clearTempData(ic);
            console.log("Cleared temporary data after transfer");
        }
        
        // Store IC in localStorage
        localStorage.setItem('userIC', ic);
        
        alert("Registration successful!");
        window.location.href = '/';

    } catch (error) {
        console.error("Detailed error:", error);
        
        let errorMessage = "Registration failed: ";
        if (error.message.includes("IC already registered")) {
            errorMessage += "This IC is already registered. Please use a different IC.";
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
  };

  //frontend interface
  return (
    <LoginBox>
        <h1>REGISTRATION</h1>
        
        <InputField 
            type="text" 
            placeholder="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)} 
            required 
        />
        
        <InputField 
            type="text" 
            placeholder="IC" 
            value={ic}
            onChange={handleICChange}
            maxLength={12}
            minLength={12}
            required 
        />
        
        <DivisionField>
            <SelectField 
                value={gender}
                onChange={(e) => setGender(e.target.value)} 
                required 
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </SelectField>
            
            <InputField 
                type="date" 
                placeholder="D.O.B" 
                value={dob}
                onChange={(e) => setDob(e.target.value)} 
                required 
            />
        </DivisionField>
        
        <InputFieldContainer>
            <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <EyeIcon onClick={togglePasswordVisibility}>
                {showPassword ? "🙈" : "👁️"}
            </EyeIcon>
        </InputFieldContainer>
        
        <InputFieldContainer>
            <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <EyeIcon onClick={togglePasswordVisibility}>
                {showPassword ? "🙈" : "👁️"}
            </EyeIcon>
        </InputFieldContainer>

        <LoginButton onClick={registerUser}>REGISTER</LoginButton>

        <h2>@ MYDENTITY 2024</h2>
    </LoginBox>
  );
};

export default App;
