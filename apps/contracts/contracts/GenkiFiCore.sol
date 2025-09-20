// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GenkiFiCore
 * @dev Social DeFi Gamified Investment Platform
 * @author GenkiFi Team
 */
contract GenkiFiCore is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ CONSTANTS ============
    uint256 public constant MIN_JOIN_AMOUNT = 1 * 10**6; // $1 USDC (6 decimals)
    uint256 public constant MAX_CIRCLE_MEMBERS = 12;
    uint256 public constant XP_CREATE_CIRCLE = 50;
    uint256 public constant XP_JOIN_CIRCLE = 25;
    uint256 public constant XP_DAILY_WORKOUT = 10;
    
    // CUSD on Alfajores
    address public constant CUSD_ADDRESS = 0x765DE816845861e75A25fCA122bb6898B8B1282a;

    // ============ STRUCTS ============
    struct Circle {
        uint256 id;
        string name;
        string[] tags;
        address creator;
        address[] members;
        uint256 totalValue;
        uint256 minInvestment;
        uint256 createdAt;
        bool isActive;
    }

    struct User {
        uint256 xp;
        uint256 level;
        uint256 lastWorkoutTime;
        uint256[] circleIds;
        bool exists;
    }

    // ============ STATE VARIABLES ============
    IERC20 public usdc;
    uint256 public nextCircleId;
    uint256 public totalUsers;
    
    mapping(uint256 => Circle) public circles;
    mapping(address => User) public users;
    mapping(address => mapping(uint256 => bool)) public userInCircle;
    mapping(address => uint256) public dailyWorkoutCount;

    // ============ EVENTS ============
    event CircleCreated(
        uint256 indexed circleId,
        address indexed creator,
        string name,
        string[] tags,
        uint256 timestamp
    );

    event UserJoinedCircle(
        uint256 indexed circleId,
        address indexed user,
        uint256 amount,
        uint256 xpEarned,
        uint256 timestamp
    );

    event DailyWorkoutCompleted(
        address indexed user,
        uint256 xpEarned,
        uint256 totalXP,
        uint256 timestamp
    );

    event XPAdded(
        address indexed user,
        uint256 amount,
        uint256 totalXP,
        uint256 newLevel,
        uint256 timestamp
    );

    event CircleUpdated(
        uint256 indexed circleId,
        uint256 totalValue,
        uint256 memberCount,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    modifier onlyValidCircle(uint256 _circleId) {
        require(_circleId < nextCircleId, "Circle does not exist");
        require(circles[_circleId].isActive, "Circle is not active");
        _;
    }

    modifier onlyCircleMember(uint256 _circleId) {
        require(userInCircle[msg.sender][_circleId], "Not a circle member");
        _;
    }

    modifier canJoinCircle(uint256 _circleId) {
        require(_circleId < nextCircleId, "Circle does not exist");
        require(circles[_circleId].isActive, "Circle is not active");
        require(circles[_circleId].members.length < MAX_CIRCLE_MEMBERS, "Circle is full");
        require(!userInCircle[msg.sender][_circleId], "Already in circle");
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor() Ownable(msg.sender) {
        usdc = IERC20(CUSD_ADDRESS);
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Create a new investment circle
     * @param _name Circle name
     * @param _tags Array of tags for the circle
     * @param _minInvestment Minimum investment amount in USDC (6 decimals)
     */
    function createCircle(
        string memory _name,
        string[] memory _tags,
        uint256 _minInvestment
    ) external nonReentrant returns (uint256) {
        require(bytes(_name).length > 0, "Circle name cannot be empty");
        require(_tags.length > 0, "Must provide at least one tag");
        require(_tags.length <= 5, "Maximum 5 tags allowed");
        require(_minInvestment > 0, "Minimum investment must be greater than 0");

        uint256 circleId = nextCircleId++;
        
        circles[circleId] = Circle({
            id: circleId,
            name: _name,
            tags: _tags,
            creator: msg.sender,
            members: new address[](0),
            totalValue: 0,
            minInvestment: _minInvestment,
            createdAt: block.timestamp,
            isActive: true
        });

        // Add creator to circle
        circles[circleId].members.push(msg.sender);
        userInCircle[msg.sender][circleId] = true;

        // Initialize user if doesn't exist
        if (!users[msg.sender].exists) {
            users[msg.sender] = User({
                xp: 0,
                level: 1,
                lastWorkoutTime: 0,
                circleIds: new uint256[](0),
                exists: true
            });
            totalUsers++;
        }

        // Add circle ID to user's circles
        users[msg.sender].circleIds.push(circleId);

        // Award XP for creating circle
        _addXP(msg.sender, XP_CREATE_CIRCLE);

        emit CircleCreated(circleId, msg.sender, _name, _tags, block.timestamp);
        emit CircleUpdated(circleId, 0, 1, block.timestamp);

        return circleId;
    }

    /**
     * @dev Join an existing investment circle
     * @param _circleId ID of the circle to join
     * @param _amount USDC amount to invest
     */
    function joinCircle(
        uint256 _circleId,
        uint256 _amount
    ) external nonReentrant canJoinCircle(_circleId) {
        require(_amount >= circles[_circleId].minInvestment, "Amount below minimum investment required");
        require(usdc.balanceOf(msg.sender) >= _amount, "Insufficient USDC balance");
        require(usdc.allowance(msg.sender, address(this)) >= _amount, "Insufficient USDC allowance");

        // Transfer USDC from user to contract
        usdc.safeTransferFrom(msg.sender, address(this), _amount);

        // Add user to circle
        circles[_circleId].members.push(msg.sender);
        circles[_circleId].totalValue += _amount;
        userInCircle[msg.sender][_circleId] = true;

        // Initialize user if doesn't exist
        if (!users[msg.sender].exists) {
            users[msg.sender] = User({
                xp: 0,
                level: 1,
                lastWorkoutTime: 0,
                circleIds: new uint256[](0),
                exists: true
            });
            totalUsers++;
        }

        // Add circle ID to user's circles
        users[msg.sender].circleIds.push(_circleId);

        // Award XP for joining circle
        _addXP(msg.sender, XP_JOIN_CIRCLE);

        emit UserJoinedCircle(_circleId, msg.sender, _amount, XP_JOIN_CIRCLE, block.timestamp);
        emit CircleUpdated(_circleId, circles[_circleId].totalValue, circles[_circleId].members.length, block.timestamp);
    }

    /**
     * @dev Complete daily workout to earn XP
     */
    function completeDailyWorkout() external nonReentrant {
        require(users[msg.sender].exists, "User does not exist");
        require(block.timestamp - users[msg.sender].lastWorkoutTime >= 1 days, "Workout already completed today");

        // Update last workout time
        users[msg.sender].lastWorkoutTime = block.timestamp;
        dailyWorkoutCount[msg.sender]++;

        // Award XP for daily workout
        _addXP(msg.sender, XP_DAILY_WORKOUT);

        emit DailyWorkoutCompleted(msg.sender, XP_DAILY_WORKOUT, users[msg.sender].xp, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user's XP and level
     * @param _user User address
     * @return xp Current XP
     * @return level Current level
     * @return nextLevelXP XP needed for next level
     */
    function getUserXP(address _user) external view returns (uint256 xp, uint256 level, uint256 nextLevelXP) {
        require(users[_user].exists, "User does not exist");
        
        xp = users[_user].xp;
        level = users[_user].level;
        nextLevelXP = _calculateXPForLevel(level + 1) - xp;
    }

    /**
     * @dev Get circle information
     * @param _circleId Circle ID
     * @return Circle struct
     */
    function getCircleInfo(uint256 _circleId) external view onlyValidCircle(_circleId) returns (Circle memory) {
        return circles[_circleId];
    }

    /**
     * @dev Get circle members
     * @param _circleId Circle ID
     * @return Array of member addresses
     */
    function getCircleMembers(uint256 _circleId) external view onlyValidCircle(_circleId) returns (address[] memory) {
        return circles[_circleId].members;
    }

    /**
     * @dev Get user's circles
     * @param _user User address
     * @return Array of circle IDs
     */
    function getUserCircles(address _user) external view returns (uint256[] memory) {
        require(users[_user].exists, "User does not exist");
        
        return users[_user].circleIds;
    }

    /**
     * @dev Get total circles count
     * @return Total number of circles created
     */
    function getTotalCircles() external view returns (uint256) {
        return nextCircleId;
    }

    /**
     * @dev Get total users count
     * @return Total number of users
     */
    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Add XP to user and update level
     * @param _user User address
     * @param _amount XP amount to add
     */
    function _addXP(address _user, uint256 _amount) internal {
        users[_user].xp += _amount;
        
        uint256 newLevel = _calculateLevel(users[_user].xp);
        uint256 oldLevel = users[_user].level;
        
        if (newLevel > oldLevel) {
            users[_user].level = newLevel;
        }

        emit XPAdded(_user, _amount, users[_user].xp, users[_user].level, block.timestamp);
    }

    /**
     * @dev Calculate level from XP
     * @param _xp User's total XP
     * @return Level
     */
    function _calculateLevel(uint256 _xp) internal pure returns (uint256) {
        if (_xp < 100) return 1;
        if (_xp < 300) return 2;
        if (_xp < 600) return 3;
        if (_xp < 1000) return 4;
        if (_xp < 1500) return 5;
        if (_xp < 2100) return 6;
        if (_xp < 2800) return 7;
        if (_xp < 3600) return 8;
        if (_xp < 4500) return 9;
        return 10; // Max level
    }

    /**
     * @dev Calculate XP required for a specific level
     * @param _level Target level
     * @return XP required
     */
    function _calculateXPForLevel(uint256 _level) internal pure returns (uint256) {
        if (_level <= 1) return 0;
        if (_level <= 2) return 100;
        if (_level <= 3) return 300;
        if (_level <= 4) return 600;
        if (_level <= 5) return 1000;
        if (_level <= 6) return 1500;
        if (_level <= 7) return 2100;
        if (_level <= 8) return 2800;
        if (_level <= 9) return 3600;
        return 4500; // Level 10
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Emergency function to deactivate a circle
     * @param _circleId Circle ID to deactivate
     */
    function deactivateCircle(uint256 _circleId) external onlyOwner onlyValidCircle(_circleId) {
        circles[_circleId].isActive = false;
        emit CircleUpdated(_circleId, circles[_circleId].totalValue, circles[_circleId].members.length, block.timestamp);
    }

    /**
     * @dev Withdraw USDC from contract (emergency only)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(usdc.balanceOf(address(this)) >= _amount, "Insufficient contract balance");
        usdc.safeTransfer(owner(), _amount);
    }

    /**
     * @dev Get contract USDC balance
     * @return Contract's USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
