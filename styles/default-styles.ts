import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screenHeader: {
    backgroundColor: "#2AA255",
    color: "#FFF",
    width: "100%",
    paddingTop: 15,
    paddingBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 24,
    marginTop: 15,
  },
  listTextItem: {
    color: "#2AA255",
    fontSize: 18,
  },
  listItem: {
    borderBottomWidth: 0,
    color: "#2AA255",
  },
  listItemSelected: {
    borderBottomWidth: 0,
  },
  button: {
    backgroundColor: "#2AA255",
    color: "#fff",
  },
  saveButtonContainer: {
    paddingTop: 25,
    paddingLeft: 15,
    paddingRight: 15,
  },
  phaseReadySwitchContainer: {
    paddingTop: 25,
    paddingRight: 15,
  },
  datePickerContainer: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
});
