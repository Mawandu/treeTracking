package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type TreeTrackingChaincode struct {
}

// Structures identiques
type TreeLog struct {
	LogID           string           `json:"logID"`
	Species         string           `json:"species"`
	Origin          string           `json:"origin"`
	Status          string           `json:"status"`
	CreatedBy       string           `json:"createdBy"`
	CreatedAt       string           `json:"createdAt"`
	OriginValidated bool             `json:"originValidated"`
	Permit          *HarvestPermit   `json:"permit,omitempty"`
	PhysicalData    *PhysicalData    `json:"physicalData,omitempty"`
	MultimediaData  []MultimediaData `json:"multimediaData,omitempty"`
	TransportStatus string           `json:"transportStatus,omitempty"`
	Purchase        *Purchase        `json:"purchase,omitempty"`
	History         []HistoryEntry   `json:"history"`
}

type HarvestPermit struct {
	PermitID       string `json:"permitID"`
	LogID          string `json:"logID"`
	IssuedBy       string `json:"issuedBy"`
	IssuedAt       string `json:"issuedAt"`
	ExpiryDate     string `json:"expiryDate"`
	IsRevoked      bool   `json:"isRevoked"`
	RevocationDate string `json:"revocationDate,omitempty"`
	RevocationBy   string `json:"revocationBy,omitempty"`
}

type PhysicalData struct {
	Dimensions string  `json:"dimensions"`
	Weight     float64 `json:"weight"`
	Quality    string  `json:"quality"`
	Marking    string  `json:"marking"`
	AddedBy    string  `json:"addedBy"`
	AddedAt    string  `json:"addedAt"`
}

type MultimediaData struct {
	IPFSHash   string            `json:"ipfsHash"`
	Metadata   map[string]string `json:"metadata"`
	UploadedBy string            `json:"uploadedBy"`
	UploadedAt string            `json:"uploadedAt"`
}

type Purchase struct {
	BuyerID     string  `json:"buyerID"`
	Price       float64 `json:"price"`
	Currency    string  `json:"currency"`
	IsCompliant bool    `json:"isCompliant"`
	ValidatedBy string  `json:"validatedBy"`
	ValidatedAt string  `json:"validatedAt"`
}

type HistoryEntry struct {
	Action      string `json:"action"`
	Actor       string `json:"actor"`
	Timestamp   string `json:"timestamp"`
	Description string `json:"description"`
}

func (t *TreeTrackingChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (t *TreeTrackingChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	switch function {
	case "InitializeLog":
		return t.InitializeLog(stub, args)
	case "ValidateOrigin":
		return t.ValidateOrigin(stub, args)
	case "IssueHarvestPermit":
		return t.IssueHarvestPermit(stub, args)
	case "RevokePermit":
		return t.RevokePermit(stub, args)
	case "DeclareHarvest":
		return t.DeclareHarvest(stub, args)
	case "AddPhysicalData":
		return t.AddPhysicalData(stub, args)
	case "UploadMultimedia":
		return t.UploadMultimedia(stub, args)
	case "UpdateTransportStatus":
		return t.UpdateTransportStatus(stub, args)
	case "RequestTraceability":
		return t.RequestTraceability(stub, args)
	case "VerifyCompliance":
		return t.VerifyCompliance(stub, args)
	case "ValidatePurchase":
		return t.ValidatePurchase(stub, args)
	case "IssueLicense":
		return t.IssueLicense(stub, args)
	case "GetLicense":
		return t.GetLicense(stub, args)
	case "TransferOwnership":
		return t.TransferOwnership(stub, args)
	case "EmergencyFreeze":
		return t.EmergencyFreeze(stub, args)
	case "UnfreezeNetwork":
		return t.UnfreezeNetwork(stub, args)
	case "GetNetworkState":
		return t.GetNetworkState(stub, args)
	case "GetLogHistory":
		return t.GetLogHistory(stub, args)
	default:
		return shim.Error("Invalid function name: " + function)
	}
}

func (t *TreeTrackingChaincode) InitializeLog(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3: logID, species, origin")
	}

	logID, species, origin := args[0], args[1], args[2]

	existing, _ := stub.GetState(logID)
	if existing != nil {
		return shim.Error("Log already exists: " + logID)
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog := TreeLog{
		LogID:           logID,
		Species:         species,
		Origin:          origin,
		Status:          "INITIALIZED",
		CreatedBy:       string(creator),
		CreatedAt:       timestamp,
		OriginValidated: false,
		History: []HistoryEntry{{
			Action:      "INITIALIZED",
			Actor:       string(creator),
			Timestamp:   timestamp,
			Description: fmt.Sprintf("Log initialized: %s from %s", species, origin),
		}},
	}

	logJSON, _ := json.Marshal(treeLog)
	stub.PutState(logID, logJSON)

	return shim.Success(logJSON)
}

func (t *TreeTrackingChaincode) ValidateOrigin(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting logID")
	}

	treeLog, err := getTreeLog(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if treeLog.Status != "INITIALIZED" {
		return shim.Error("Log must be in INITIALIZED status")
	}

	treeLog.OriginValidated = true
	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "ORIGIN_VALIDATED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: "Origin validated",
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) IssueHarvestPermit(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3: logID, permitID, expiryDate")
	}

	logID, permitID, expiryDate := args[0], args[1], args[2]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	if !treeLog.OriginValidated {
		return shim.Error("Origin must be validated first")
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Permit = &HarvestPermit{
		PermitID:   permitID,
		LogID:      logID,
		IssuedBy:   string(creator),
		IssuedAt:   timestamp,
		ExpiryDate: expiryDate,
		IsRevoked:  false,
	}

	treeLog.Status = "PERMITTED"
	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "PERMIT_ISSUED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: fmt.Sprintf("Permit %s issued", permitID),
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) RevokePermit(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2: logID, reason")
	}

	logID, reason := args[0], args[1]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	if treeLog.Permit == nil {
		return shim.Error("No permit exists")
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Permit.IsRevoked = true
	treeLog.Permit.RevocationDate = timestamp
	treeLog.Permit.RevocationBy = string(creator)

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "PERMIT_REVOKED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: reason,
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) DeclareHarvest(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting logID")
	}

	treeLog, err := getTreeLog(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	if treeLog.Status != "PERMITTED" {
		return shim.Error("Log must have valid permit")
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Status = "HARVESTED"
	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "HARVEST_DECLARED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: "Harvest started",
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) AddPhysicalData(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	logID, dimensions, weight, quality, marking := args[0], args[1], args[2], args[3], args[4]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	var w float64
	fmt.Sscanf(weight, "%f", &w)

	treeLog.PhysicalData = &PhysicalData{
		Dimensions: dimensions,
		Weight:     w,
		Quality:    quality,
		Marking:    marking,
		AddedBy:    string(creator),
		AddedAt:    timestamp,
	}

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "PHYSICAL_DATA_ADDED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: fmt.Sprintf("Data: %s, %.2fkg", dimensions, w),
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) UploadMultimedia(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	logID, ipfsHash, metadata := args[0], args[1], args[2]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	var metadataMap map[string]string
	json.Unmarshal([]byte(metadata), &metadataMap)

	multimedia := MultimediaData{
		IPFSHash:   ipfsHash,
		Metadata:   metadataMap,
		UploadedBy: string(creator),
		UploadedAt: timestamp,
	}

	treeLog.MultimediaData = append(treeLog.MultimediaData, multimedia)

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "MULTIMEDIA_UPLOADED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: "IPFS: " + ipfsHash,
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) UpdateTransportStatus(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	logID, status := args[0], args[1]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Status = "TRANSPORTED"
	treeLog.TransportStatus = status

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "TRANSPORT_UPDATED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: status,
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) RequestTraceability(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting logID")
	}

	logBytes, err := stub.GetState(args[0])
	if err != nil || logBytes == nil {
		return shim.Error("Log not found")
	}

	return shim.Success(logBytes)
}

func (t *TreeTrackingChaincode) VerifyCompliance(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting logID")
	}

	treeLog, err := getTreeLog(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	compliant := treeLog.OriginValidated &&
		treeLog.Permit != nil &&
		!treeLog.Permit.IsRevoked &&
		treeLog.PhysicalData != nil &&
		len(treeLog.MultimediaData) > 0

	result := map[string]interface{}{
		"compliant": compliant,
		"logID":     treeLog.LogID,
	}

	resultBytes, _ := json.Marshal(result)
	return shim.Success(resultBytes)
}

func (t *TreeTrackingChaincode) ValidatePurchase(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	logID, buyerID, price, currency := args[0], args[1], args[2], args[3]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	if treeLog.Status == "SOLD" {
		return shim.Error("Already sold")
	}

	var p float64
	fmt.Sscanf(price, "%f", &p)

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Purchase = &Purchase{
		BuyerID:     buyerID,
		Price:       p,
		Currency:    currency,
		IsCompliant: true,
		ValidatedBy: string(creator),
		ValidatedAt: timestamp,
	}

	treeLog.Status = "SOLD"

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "PURCHASE_VALIDATED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: fmt.Sprintf("Sold to %s for %.2f %s", buyerID, p, currency),
	})

	return putTreeLog(stub, treeLog)
}

func (t *TreeTrackingChaincode) GetLogHistory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting logID")
	}

	logBytes, err := stub.GetState(args[0])
	if err != nil || logBytes == nil {
		return shim.Error("Log not found")
	}

	return shim.Success(logBytes)
}

func getTreeLog(stub shim.ChaincodeStubInterface, logID string) (*TreeLog, error) {
	logBytes, err := stub.GetState(logID)
	if err != nil {
		return nil, fmt.Errorf("failed to read log: %v", err)
	}
	if logBytes == nil {
		return nil, fmt.Errorf("log %s does not exist", logID)
	}

	var treeLog TreeLog
	json.Unmarshal(logBytes, &treeLog)
	return &treeLog, nil
}

func putTreeLog(stub shim.ChaincodeStubInterface, treeLog *TreeLog) pb.Response {
	logJSON, _ := json.Marshal(treeLog)
	stub.PutState(treeLog.LogID, logJSON)
	return shim.Success(logJSON)
}

func main() {
	err := shim.Start(new(TreeTrackingChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %s", err)
	}
}

// ============ NOUVELLES STRUCTURES ============

type License struct {
	LicenseID       string   `json:"licenseID"`
	CompanyMSP      string   `json:"companyMSP"`
	TotalCubage     float64  `json:"totalCubage"`
	RemainingCubage float64  `json:"remainingCubage"`
	ExpiryDate      string   `json:"expiryDate"`
	IssuedAt        string   `json:"issuedAt"`
	IssuedBy        string   `json:"issuedBy"`
	LogIDs          []string `json:"logIDs"`
	IsRevoked       bool     `json:"isRevoked"`
}

type NetworkState struct {
	IsFrozen bool   `json:"isFrozen"`
	Reason   string `json:"reason"`
	FrozenAt string `json:"frozenAt"`
	FrozenBy string `json:"frozenBy"`
}

// ============ FONCTIONS LICENSE ============

func (t *TreeTrackingChaincode) IssueLicense(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect arguments. Expecting: licenseID, companyMSP, totalCubage, expiryDate")
	}

	licenseID, companyMSP, totalCubageStr, expiryDate := args[0], args[1], args[2], args[3]

	var totalCubage float64
	fmt.Sscanf(totalCubageStr, "%f", &totalCubage)

	existing, _ := stub.GetState(licenseID)
	if existing != nil {
		return shim.Error("License already exists")
	}

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	license := License{
		LicenseID:       licenseID,
		CompanyMSP:      companyMSP,
		TotalCubage:     totalCubage,
		RemainingCubage: totalCubage,
		ExpiryDate:      expiryDate,
		IssuedAt:        timestamp,
		IssuedBy:        string(creator),
		LogIDs:          []string{},
		IsRevoked:       false,
	}

	licenseJSON, _ := json.Marshal(license)
	stub.PutState(licenseID, licenseJSON)

	return shim.Success(licenseJSON)
}

func (t *TreeTrackingChaincode) GetLicense(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect arguments. Expecting licenseID")
	}

	licenseBytes, err := stub.GetState(args[0])
	if err != nil || licenseBytes == nil {
		return shim.Error("License not found")
	}

	return shim.Success(licenseBytes)
}

// ============ FONCTIONS TRANSFER ============

func (t *TreeTrackingChaincode) TransferOwnership(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect arguments. Expecting: logID, newBuyerID, price, currency")
	}

	logID, newBuyerID, price, currency := args[0], args[1], args[2], args[3]

	treeLog, err := getTreeLog(stub, logID)
	if err != nil {
		return shim.Error(err.Error())
	}

	if treeLog.Status != "SOLD" {
		return shim.Error("Log must be SOLD before transfer")
	}

	var p float64
	fmt.Sscanf(price, "%f", &p)

	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	treeLog.Purchase.BuyerID = newBuyerID
	treeLog.Purchase.Price = p
	treeLog.Purchase.Currency = currency
	treeLog.Purchase.ValidatedBy = string(creator)
	treeLog.Purchase.ValidatedAt = timestamp

	treeLog.History = append(treeLog.History, HistoryEntry{
		Action:      "OWNERSHIP_TRANSFERRED",
		Actor:       string(creator),
		Timestamp:   timestamp,
		Description: fmt.Sprintf("Transferred to %s for %.2f %s", newBuyerID, p, currency),
	})

	return putTreeLog(stub, treeLog)
}

// ============ FONCTIONS FREEZE ============

func (t *TreeTrackingChaincode) EmergencyFreeze(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect arguments. Expecting reason")
	}

	reason := args[0]
	creator, _ := stub.GetCreator()
	timestamp := time.Now().Format(time.RFC3339)

	state := NetworkState{
		IsFrozen: true,
		Reason:   reason,
		FrozenAt: timestamp,
		FrozenBy: string(creator),
	}

	stateJSON, _ := json.Marshal(state)
	stub.PutState("NETWORK_STATE", stateJSON)

	return shim.Success(nil)
}

func (t *TreeTrackingChaincode) UnfreezeNetwork(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	state := NetworkState{IsFrozen: false}
	stateJSON, _ := json.Marshal(state)
	stub.PutState("NETWORK_STATE", stateJSON)
	return shim.Success(nil)
}

func (t *TreeTrackingChaincode) GetNetworkState(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	stateBytes, err := stub.GetState("NETWORK_STATE")
	if err != nil || stateBytes == nil {
		defaultState := NetworkState{IsFrozen: false}
		defaultJSON, _ := json.Marshal(defaultState)
		return shim.Success(defaultJSON)
	}
	return shim.Success(stateBytes)
}
