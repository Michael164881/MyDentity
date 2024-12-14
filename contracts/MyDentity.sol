// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract MyDentity {
    // Structures

    // DATA STRUCTURE FOR REGISTRATION AND LOGIN PURPOSES
    struct User {
        string IC; 
        string role; // User role (Admin, User (Citizens), Government Agency)
        bool registered; // To check if the user has been registered or not
        uint256 currentVersion; 
        uint256[] dataVersions;
    }

    // DATA STRUCTURE TO STORE USER DATA
    struct UserData {
        // Personal Data
        string fullName;
        string gender;
        uint256 DOB;

        // User Account
        bytes32 passwordHash;
        
        // Address
        string homeAddress;
        string state;
        string city;
        string zipCode;
        
        // Education
        string educationLevel;
        uint256 graduationYear;
        string institution;
        
        // Household
        uint256 householdSize;
        uint256 householdIncome;
        uint256 dependents;
        
        // Income
        string incomeSource;
        string incomeFrequency;
        uint256 incomeAmount;
        string incomeNotes;
        
        // Occupation
        string occupation;
        string employer;
        uint256 yearsOfExperience;
        
        // Commitment
        string commitmentType;
        string commitmentDetails;
        uint256 commitmentAmount;
        
        // Relief
        string reliefType;
        string reliefDetails;
        uint256 reliefAmount;
        
        // Version Control
        uint256 version;
        uint256 timestamp;
        bool isActive;

        //Agency
        string agencyName;
    }

    // ===== TEMPORARY DATA =====
    struct TempUser {
        string IC; 
        uint256 currentVersion;
        uint256[] dataVersions;
    }

    struct TempUserData {
        TempPersonalInfo personal;
        TempAddressInfo personalAddress;
        TempEducationInfo education;
        TempFinancialInfo financial;
        TempEmploymentInfo employment;
        TempCommitmentInfo commitment;
        TempReliefInfo relief;
        
        // Version Control
        uint256 version;
        uint256 timestamp;
        bool isActive;
        string agencyName;
    }

    struct TempPersonalInfo {
        string fullName;
        string gender;
        uint256 DOB;
        bytes32 passwordHash;
    }

    struct TempAddressInfo {
        string homeAddress;
        string state;
        string city;
        string zipCode;
    }

    struct TempEducationInfo {
        string educationLevel;
        uint256 graduationYear;
        string institution;
    }

    struct TempFinancialInfo {
        // Household
        uint256 householdSize;
        uint256 householdIncome;
        uint256 dependents;
        // Income
        string incomeSource;
        string incomeFrequency;
        uint256 incomeAmount;
        string incomeNotes;
    }

    struct TempEmploymentInfo {
        string occupation;
        string employer;
        uint256 yearsOfExperience;
    }

    struct TempCommitmentInfo {
        string commitmentType;
        string commitmentDetails;
        uint256 commitmentAmount;
    }

    struct TempReliefInfo {
        string reliefType;
        string reliefDetails;
        uint256 reliefAmount;
    }

    // Agency struct for storing government agency details
    struct Agency {
        string name;
        string contact;
        bytes32 passwordHash; // Stored password hash for secure login
        bool active;
    }

    mapping(string => User) public users; // Maps IC to User struct
    mapping(address => string[]) public addressToICs; // Maps single address to manage multiple IC
    mapping(string => address) public icToAddress; // Maps IC to user address (To check IC is registered to which particular address)
    mapping(string => mapping(uint256 => UserData)) public userData;
    mapping(uint256 => Agency) public agencies;
    mapping(string => uint256) public userPermissions; // mapping from IC to the user's bitmap

    // ===== TEMPORARY DATA =====
    mapping(string => TempUser) public tempUsers;
    mapping(string => mapping(uint256 => TempUserData)) public tempUserData; // IC => TempUserData
    mapping(string => bool) private hasTempData;

    // ===== COUNTERS FOR DATA ANALYTICS =====
    uint256 public agencyCount;
    uint256 private totalUsers;
    uint256 private totalAgencies;
    uint256 private totalUpdates;

    // Hardcoded admin credentials
    string constant adminUsername = "admin1234";
    string constant adminPassword = "admin@secure123";

    // Modifier to ensure that only the admin can perform certain actions
    modifier onlyAdmin(string memory _username, string memory _password) {
        require(keccak256(abi.encodePacked(_username)) == keccak256(abi.encodePacked(adminUsername)), "Invalid username.");
        require(keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(adminPassword)), "Invalid password.");
        _;
    }

    // Events
    event UserRegistered(address indexed userAddress, string IC, string role); // Registration event
    event LoginAttempt(address indexed userAddress, bool success, string role); // Login event
    event DataVersionCreated(address indexed user, uint256 version, uint256 timestamp); // Data Version Created
    event AgencyRegistered(uint256 indexed agencyCode, string name, string contact); // Agency registration event
    event PermissionUpdated(string indexed userIC, uint256 agencyCode, bool granted); // Permission update event
    event AgencyUpdated(uint256 agencyId, string name, string contact); //Update Agency Details

    //======= LOGIN AND REGISTRATION MANAGEMENT ========
    // Register a new government agency
    function registerAgency(string memory _name, string memory _contact, bytes32 _password) public {
        agencyCount++; // Increment agency count
        // Check if user is registered
        require(!agencies[agencyCount].active, "Agency already registered");

        agencies[agencyCount] = Agency({
            name: _name,
            contact: _contact,
            passwordHash: _password, // Store hashed password
            active: true // By default, the agency is active
        });
        totalAgencies++;
    }

    // Register a new user
    function registerUser(
        address _userAddress,
        string memory _ic,
        string memory _role 
    ) public {
        require(icToAddress[_ic] == address(0), "IC already registered");

        //initialize empty array for data version
        uint256[] memory emptyVersions;

        // Store user information
        User storage newUser = users[_ic];
        newUser.registered = true;
        newUser.IC = _ic;
        newUser.role = _role;
        newUser.currentVersion = 0;        
        newUser.dataVersions = emptyVersions;

        icToAddress[_ic] = _userAddress; // Map IC to user address

        addressToICs[_userAddress].push(_ic);
        totalUsers++;
        userPermissions[_ic] = 0; // sets all permissions to 0

        emit UserRegistered(_userAddress, _ic, _role);
    }   

    //Login User
    function loginUser(
        string memory _ic,
        bytes32 _passwordHash
    ) public view returns (string memory fullName, string memory role) {
        // Ensure the IC is registered in the User structure
        User memory user = users[_ic];
        require(user.registered, "User not registered."); // Check if the IC is registered
        uint256 currentVersion = users[_ic].currentVersion;
        UserData memory latestData = userData[_ic][currentVersion];

        require(latestData.passwordHash == _passwordHash, "Incorrect password."); // Verify password hash

        // Return user details from User structure
        return (latestData.fullName, user.role);
    }

    //Login Agency
    function loginAgency(uint256 _agencyID, bytes32 _password) public view returns (bool, string memory) {
        Agency memory agency = agencies[_agencyID];
        require(agency.active, "Agency not active.");
        if (_password == agency.passwordHash) {
            return (true, "Agency login successful");
        }
        return (false, "Invalid password.");
    }
    function isAgency(uint256 _id) public view returns (bool) {
        return agencies[_id].active;
    }

    //Login Admin
    function loginAdmin(string memory _username, string memory _password) public view returns (bool, string memory) {
        if (keccak256(abi.encodePacked(_username)) == keccak256(abi.encodePacked(adminUsername)) &&
            keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(adminPassword))) {
            return (true, "Admin login successful");
        }
        return (false, "Invalid admin credentials.");
    }


    //======= PERMISSION DATA CONTROL =======
    // Function to set user permissions
    function setUserPermissions(string memory _IC, uint256 _agencyID, bool _permission) public {
        User memory user = users[_IC];
        require(user.registered, "User not registered.");
        uint256 currentPermissions = userPermissions[_IC];
        if (_permission) {
            currentPermissions |= (1 << (_agencyID - 1)); // Set the bit corresponding to the agency
        } else {
            currentPermissions &= ~(1 << (_agencyID - 1)); // Clear the bit corresponding to the agency
        }
        userPermissions[_IC] = currentPermissions;
    }

    // Check if user has permission for an agency
    function checkPermission(string memory _IC, uint256 _agencyID) public view returns (bool) {
        require(users[_IC].registered, "User not registered.");
        uint256 permissions = userPermissions[_IC];
        return (permissions & (1 << (_agencyID - 1))) != 0;
    }

    //To display agency's permission to user
    function getUserPermissions(string memory _IC) public view returns (Agency[] memory, bool[] memory) {
        require(users[_IC].registered, "User not registered.");
        
        // Create arrays to store agency details and permissions
        Agency[] memory activeAgencies = new Agency[](agencyCount);
        bool[] memory permissions = new bool[](agencyCount);
        
        // Retrieve user's permission bitmap
        uint256 userBitmap = userPermissions[_IC];
        
        // Loop through registered agencies
        for (uint256 i = 1; i <= agencyCount; i++) {
            // Retrieve agency details
            activeAgencies[i - 1] = agencies[i];
            
            // Check the permission bit
            permissions[i - 1] = (userBitmap & (1 << (i - 1))) != 0;
        }
        
        return (activeAgencies, permissions);
    }

    //======= AGENCY ======
    // Function to update the agency information
    function updateAgency(uint256 agencyId, string memory _name, string memory _contact, bytes32 _passwordHash) public {
        Agency storage agency = agencies[agencyId];
        agency.name = _name;
        agency.contact = _contact;
        agency.passwordHash = _passwordHash;
        
        emit AgencyUpdated(agencyId, _name, _contact);
    }

    // Function to get the details of an agency
    function getAgency(uint256 agencyId) public view returns (uint256, string memory, string memory) {
        Agency storage agency = agencies[agencyId];
        return (agencyId, agency.name, agency.contact);
    }

    // Function to get the total number of registered agencies
    function getAgencyCount() public view returns (uint256) {
        return agencyCount;
    }

    //======= DATA VERSION CONTROL ========
    // Store user data with version control
    function storeUserData(
        string memory _ic, //IC as identifier
        // Personal Data
        string memory _fullName,
        string memory _gender,
        uint256 _DOB,
        //User Account
        bytes32 _passwordHash,
        // Address
        string memory _homeAddress,
        string memory _state,
        string memory _city,
        string memory _zipCode,
        // Education
        string memory _educationLevel,
        uint256 _graduationYear,
        string memory _institution,
        // Household
        uint256 _householdSize,
        uint256 _householdIncome,
        uint256 _dependents,
        // Income
        string memory _incomeSource,
        string memory _incomeFrequency,
        uint256 _incomeAmount,
        string memory _incomeNotes,
        // Occupation
        string memory _occupation,
        string memory _employer,
        uint256 _yearsOfExperience,
        // Commitment
        string memory _commitmentType,
        string memory _commitmentDetails,
        uint256 _commitmentAmount,
        // Relief
        string memory _reliefType,
        string memory _reliefDetails,
        uint256 _reliefAmount,
        //Agency
        bool _isAgency,
        string memory _agencyName
    ) public {

        if(!_isAgency){
        //USER OR CITIZEN PAGE UPLOAD
             // Check if user is registered
            require(users[_ic].registered, "User not registered");
            uint256 newVersion = 1;

            // Store the data
            userData[_ic][newVersion] = UserData({
                fullName: _fullName,
                gender: _gender,
                DOB: _DOB,
                //User Account
                passwordHash: _passwordHash,
                // Address
                homeAddress: _homeAddress,
                state: _state,
                city: _city,
                zipCode: _zipCode,
                // Education
                educationLevel: _educationLevel,
                graduationYear: _graduationYear,
                institution: _institution,
                // Household
                householdSize: _householdSize,
                householdIncome: _householdIncome,
                dependents: _dependents,
                // Income
                incomeSource: _incomeSource,
                incomeFrequency: _incomeFrequency,
                incomeAmount: _incomeAmount,
                incomeNotes: _incomeNotes,
                // Occupation
                occupation: _occupation,
                employer: _employer,
                yearsOfExperience: _yearsOfExperience,
                // Commitment
                commitmentType: _commitmentType,
                commitmentDetails: _commitmentDetails,
                commitmentAmount: _commitmentAmount,
                // Relief
                reliefType: _reliefType,
                reliefDetails: _reliefDetails,
                reliefAmount: _reliefAmount,
                // Version Control
                version: newVersion,
                timestamp: block.timestamp,
                isActive: true,
                //Agency
                agencyName: _agencyName
            });

            users[_ic].currentVersion = newVersion;
            totalUpdates++;

            emit DataVersionCreated(icToAddress[_ic], newVersion, block.timestamp);
        }
        else{
            //AGENCY PAGE UPLOAD

            //Check if user registered
            if(users[_ic].registered){
                uint256[] memory versions = users[_ic].dataVersions;
                uint256 newVersion;
                
                if(versions.length == 0) {
                    newVersion = 2; // Start agency versions from 2
                } else {
                    uint256 latestVersion = versions[0];
                    for (uint256 i = 1; i < versions.length; i++) {
                        if (versions[i] > latestVersion) {
                            latestVersion = versions[i];
                        }
                    }
                    newVersion = latestVersion + 1;
                }

                // Store the data
                userData[_ic][newVersion] = UserData({
                    fullName: _fullName,
                    gender: _gender,
                    DOB: _DOB,
                    //User Account
                    passwordHash: _passwordHash,
                    // Address
                    homeAddress: _homeAddress,
                    state: _state,
                    city: _city,
                    zipCode: _zipCode,
                    // Education
                    educationLevel: _educationLevel,
                    graduationYear: _graduationYear,
                    institution: _institution,
                    // Household
                    householdSize: _householdSize,
                    householdIncome: _householdIncome,
                    dependents: _dependents,
                    // Income
                    incomeSource: _incomeSource,
                    incomeFrequency: _incomeFrequency,
                    incomeAmount: _incomeAmount,
                    incomeNotes: _incomeNotes,
                    // Occupation
                    occupation: _occupation,
                    employer: _employer,
                    yearsOfExperience: _yearsOfExperience,
                    // Commitment
                    commitmentType: _commitmentType,
                    commitmentDetails: _commitmentDetails,
                    commitmentAmount: _commitmentAmount,
                    // Relief
                    reliefType: _reliefType,
                    reliefDetails: _reliefDetails,
                    reliefAmount: _reliefAmount,
                    // Version Control
                    version: newVersion,
                    timestamp: block.timestamp,
                    isActive: true,
                    //Agency
                    agencyName: _agencyName
                });
                // Update the user's current version

                users[_ic].dataVersions.push(newVersion);
                totalUpdates++;

                emit DataVersionCreated(icToAddress[_ic], newVersion, block.timestamp);
            }
            else{
                
            }
        }
       
    }

    function storeUserDataRegister(
        string memory _ic, //IC as identifier
        // Personal Data
        string memory _fullName,
        string memory _gender,
        uint256 _DOB,
        //User Account
        bytes32 _passwordHash,
        // Address
        string memory _homeAddress,
        string memory _state,
        string memory _city,
        string memory _zipCode,
        // Education
        string memory _educationLevel,
        uint256 _graduationYear,
        string memory _institution,
        // Household
        uint256 _householdSize,
        uint256 _householdIncome,
        uint256 _dependents,
        // Income
        string memory _incomeSource,
        string memory _incomeFrequency,
        uint256 _incomeAmount,
        string memory _incomeNotes,
        // Occupation
        string memory _occupation,
        string memory _employer,
        uint256 _yearsOfExperience,
        // Commitment
        string memory _commitmentType,
        string memory _commitmentDetails,
        uint256 _commitmentAmount,
        // Relief
        string memory _reliefType,
        string memory _reliefDetails,
        uint256 _reliefAmount,
        //Agency
        string memory _agencyName
    ) public {
            require(users[_ic].registered, "User not registered");
            uint256 newVersion = users[_ic].currentVersion + 1;

            // Store the data
            userData[_ic][newVersion] = UserData({
                fullName: _fullName,
                gender: _gender,
                DOB: _DOB,
                //User Account
                passwordHash: _passwordHash,
                // Address
                homeAddress: _homeAddress,
                state: _state,
                city: _city,
                zipCode: _zipCode,
                // Education
                educationLevel: _educationLevel,
                graduationYear: _graduationYear,
                institution: _institution,
                // Household
                householdSize: _householdSize,
                householdIncome: _householdIncome,
                dependents: _dependents,
                // Income
                incomeSource: _incomeSource,
                incomeFrequency: _incomeFrequency,
                incomeAmount: _incomeAmount,
                incomeNotes: _incomeNotes,
                // Occupation
                occupation: _occupation,
                employer: _employer,
                yearsOfExperience: _yearsOfExperience,
                // Commitment
                commitmentType: _commitmentType,
                commitmentDetails: _commitmentDetails,
                commitmentAmount: _commitmentAmount,
                // Relief
                reliefType: _reliefType,
                reliefDetails: _reliefDetails,
                reliefAmount: _reliefAmount,
                // Version Control
                version: newVersion,
                timestamp: block.timestamp,
                isActive: true,
                //Agency
                agencyName: _agencyName
            });

            users[_ic].currentVersion = newVersion;
            users[_ic].dataVersions.push(newVersion);
            totalUpdates++;

            emit DataVersionCreated(icToAddress[_ic], newVersion, block.timestamp);
        }

    function TempStoreUserData(
        string memory _ic,
        TempPersonalInfo memory personal,
        TempAddressInfo memory personalAddress,
        TempEducationInfo memory education,
        TempFinancialInfo memory financial,
        TempEmploymentInfo memory employment,
        TempCommitmentInfo memory commitment,
        TempReliefInfo memory relief,
        string memory _agencyName
    ) public {
            require(!users[_ic].registered, "User already registered");

            uint256 newVersion;
            if (!hasTempData[_ic]) {
                // First time storing temp data for this IC
                tempUsers[_ic].IC = _ic;
                tempUsers[_ic].currentVersion = 1;
                newVersion = 1;
                hasTempData[_ic] = true;
            } else {
                // Get the next version number
                uint256[] memory versions = tempUsers[_ic].dataVersions;
                if (versions.length == 0) {
                    newVersion = 2;
                } else {
                    newVersion = tempUsers[_ic].currentVersion + 1;
                }
            }

            // Store the data
            tempUserData[_ic][newVersion] = TempUserData({
                personal: TempPersonalInfo({
                    fullName: personal.fullName,
                    gender: personal.gender,
                    DOB: personal.DOB,
                    passwordHash: personal.passwordHash
                }),
                personalAddress: TempAddressInfo({
                    homeAddress: personalAddress.homeAddress,
                    state: personalAddress.state,
                    city: personalAddress.city,
                    zipCode: personalAddress.zipCode
                }),
                education: TempEducationInfo({
                    educationLevel: education.educationLevel,
                    graduationYear: education.graduationYear,
                    institution: education.institution
                }),
                financial: TempFinancialInfo({
                    householdSize: financial.householdSize,
                    householdIncome: financial.householdIncome,
                    dependents: financial.dependents,
                    incomeSource: financial.incomeSource,
                    incomeFrequency: financial.incomeFrequency,
                    incomeAmount: financial.incomeAmount,
                    incomeNotes: financial.incomeNotes
                }),
                employment: TempEmploymentInfo({
                    occupation: employment.occupation,
                    employer: employment.employer,
                    yearsOfExperience: employment.yearsOfExperience
                }),
                commitment: TempCommitmentInfo({
                    commitmentType: commitment.commitmentType,
                    commitmentDetails: commitment.commitmentDetails,
                    commitmentAmount: commitment.commitmentAmount
                }),
                relief: TempReliefInfo({
                    reliefType: relief.reliefType,
                    reliefDetails: relief.reliefDetails,
                    reliefAmount: relief.reliefAmount
                }),
                version: newVersion,
                timestamp: block.timestamp,
                isActive: true,
                agencyName: _agencyName
            });

            tempUsers[_ic].dataVersions.push(newVersion);
        }
    
    //===== HELPER FUNCTION FOR TEMPSTOREUSERDATA ===== 
    function createTempPersonalInfo(
        string memory _fullName,
        string memory _gender,
        uint256 _DOB,
        bytes32 _passwordHash
    ) public pure returns (TempPersonalInfo memory) {
        return TempPersonalInfo({
            fullName: _fullName,
            gender: _gender,
            DOB: _DOB,
            passwordHash: _passwordHash
        });
    }

    function createTempAddressInfo(
        string memory _homeAddress,
        string memory _state,
        string memory _city,
        string memory _zipCode
    ) public pure returns (TempAddressInfo memory) {
        return TempAddressInfo({
            homeAddress: _homeAddress,
            state: _state,
            city: _city,
            zipCode: _zipCode
        });
    }

    function createTempEducationInfo(
        string memory _educationLevel,
        uint256 _graduationYear,
        string memory _institution
    ) public pure returns (TempEducationInfo memory) {
        return TempEducationInfo({
            educationLevel: _educationLevel,
            graduationYear: _graduationYear,
            institution: _institution
        });
    }

    function createTempFinancialInfo(
        uint256 _householdSize,
        uint256 _householdIncome,
        uint256 _dependents,
        string memory _incomeSource,
        string memory _incomeFrequency,
        uint256 _incomeAmount,
        string memory _incomeNotes
    ) public pure returns (TempFinancialInfo memory) {
        return TempFinancialInfo({
            householdSize: _householdSize,
            householdIncome: _householdIncome,
            dependents: _dependents,
            incomeSource: _incomeSource,
            incomeFrequency: _incomeFrequency,
            incomeAmount: _incomeAmount,
            incomeNotes: _incomeNotes
        });
    }

    function createTempEmploymentInfo(
        string memory _occupation,
        string memory _employer,
        uint256 _yearsOfExperience
    ) public pure returns (TempEmploymentInfo memory) {
        return TempEmploymentInfo({
            occupation: _occupation,
            employer: _employer,
            yearsOfExperience: _yearsOfExperience
        });
    }

    function createTempCommitmentInfo(
        string memory _commitmentType,
        string memory _commitmentDetails,
        uint256 _commitmentAmount
    ) public pure returns (TempCommitmentInfo memory) {
        return TempCommitmentInfo({
            commitmentType: _commitmentType,
            commitmentDetails: _commitmentDetails,
            commitmentAmount: _commitmentAmount
        });
    }

    function createTempReliefInfo(
        string memory _reliefType,
        string memory _reliefDetails,
        uint256 _reliefAmount
    ) public pure returns (TempReliefInfo memory) {
        return TempReliefInfo({
            reliefType: _reliefType,
            reliefDetails: _reliefDetails,
            reliefAmount: _reliefAmount
        });
    }

    // Check if IC has temporary data
    function hasTempUserData(string memory _ic) public view returns (bool) {
        return hasTempData[_ic];
    }

    // Get all temp data for IC
    function getTempUserData(string memory _ic) public view returns (TempUserData[] memory) {
        require(hasTempData[_ic], "No temporary data found for this IC");
    
        // Get all version numbers
        uint256[] memory versions = tempUsers[_ic].dataVersions;
        
        // Create array to hold all temp data versions
        TempUserData[] memory allTempData = new TempUserData[](versions.length);
        
        // Populate array with temp data from each version
        for (uint256 i = 0; i < versions.length; i++) {
            allTempData[i] = tempUserData[_ic][versions[i]];
        }
        
        return allTempData;
    }

    // Get temp version number
    function getTempUserVersions(string memory _ic) public view returns (uint256[] memory) {
        require(hasTempData[_ic], "No temporary data found for this IC");
        return tempUsers[_ic].dataVersions;
    }

    function getTempUserDataByVersion(string memory _ic, uint256 _version) public view returns (TempUserData memory) {
        require(hasTempData[_ic], "No temporary data found for this IC");
        require(tempUserData[_ic][_version].isActive, "Version does not exist");
        return tempUserData[_ic][_version];
    }

    function getLatestTempUserData(string memory _ic) public view returns (TempUserData memory) {
        require(hasTempData[_ic], "No temporary data found for this IC");
        uint256 currentVersion = tempUsers[_ic].currentVersion;
        return tempUserData[_ic][currentVersion];
    }

    function getLatestTempVersion(uint256[] memory versions) internal pure returns (uint256) {
        uint256 latestVersion = versions[0];
        for (uint256 i = 1; i < versions.length; i++) {
            if (versions[i] > latestVersion) {
                latestVersion = versions[i];
            }
        }
        return latestVersion;
    }

    // Clear temp data after user registration
    function clearTempData(string memory _ic) public {
        require(users[_ic].registered, "User not registered");
        
        // Clear all versions
        uint256[] memory versions = tempUsers[_ic].dataVersions;
        for (uint256 i = 0; i < versions.length; i++) {
            delete tempUserData[_ic][versions[i]];
        }
        
        delete tempUsers[_ic];
        hasTempData[_ic] = false;
    }

    // Get current version of user data
    function getCurrentUserData(string memory _ic) public view returns (UserData memory) {
        require(users[_ic].registered, "User not registered");
        
        uint256 currentVersion = users[_ic].currentVersion;
        
        // If no data exists yet, return empty structure
        if (currentVersion == 0) {
            return UserData({
                fullName: "",
                gender: "",
                DOB: 0,
                passwordHash: "",
                homeAddress: "",
                state: "",
                city: "",
                zipCode: "",
                educationLevel: "",
                graduationYear: 0,
                institution: "",
                householdSize: 0,
                householdIncome: 0,
                dependents: 0,
                incomeSource: "",
                incomeFrequency: "",
                incomeAmount: 0,
                incomeNotes: "",
                occupation: "",
                employer: "",
                yearsOfExperience: 0,
                commitmentType: "",
                commitmentDetails: "",
                commitmentAmount: 0,
                reliefType: "",
                reliefDetails: "",
                reliefAmount: 0,
                version: 0,
                timestamp: 0,
                isActive: false,
                //Agency
                agencyName: ""
            });
        }

        
        return userData[_ic][currentVersion];
    }

    //Get latest version value from stack
    function getLatestVersion(string memory _ic) internal view returns (uint256) {
        uint256[] memory versions = users[_ic].dataVersions;
        require(versions.length > 0, "No versions available");

        uint256 latestVersion = versions[0];
        for (uint256 i = 1; i < versions.length; i++) {
            if (versions[i] > latestVersion) {
                latestVersion = versions[i];
            }
        }
        return latestVersion;
    }

    function setCurrentVersion(string memory _ic, uint256 _version) public{
        users[_ic].currentVersion = _version;
    }

    // Get specific version of user data
    function getUserDataByVersion(string memory _ic, uint256 _version) public view returns (UserData memory) {
        require(users[_ic].registered, "User not registered");
        
        return userData[_ic][_version];
    }

    // Get all version numbers for a user
    function getUserDataVersions(string memory _ic) public view returns (uint256[] memory) {
        require(users[_ic].registered, "User not registered");
        return users[_ic].dataVersions;
    }

    //========= ANALYTICS =========
    function getTotalUsers() public view returns (uint256) {
        return totalUsers;
    }

    function getTotalAgencies() public view returns (uint256) {
        return totalAgencies;
    }

    function getTotalUpdates() public view returns (uint256) {
        return totalUpdates;
    }
}
