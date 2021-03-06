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
    marginTop: 15
  },
  listContainer: {
    marginTop: 25,
    marginHorizontal: 10
  },
  topicItemText: {
    textAlignVertical: "center",
    fontSize: 18,
    width: 200,
    height: 50,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400"
  },
  topicItemBase: {
    padding: 10,
    margin: 15,
    marginBottom: 0,
    marginTop: 10,
    height: 75,
    borderWidth: 1,
    borderColor: "#53B02B",
    backgroundColor: "#53B02B",
    borderRadius: 7,
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  listTextItem: {
    color: "#2AA255",
    fontSize: 18
  },
  listItem: {
    borderBottomWidth: 0,
    color: "#2AA255"
  },
  listItemSelected: {
    borderBottomWidth: 0
  },
  button: {
    backgroundColor: "#2AA255",
    color: "#fff"
  },
  saveButtonContainer: {
    paddingTop: 25,
    paddingLeft: 15,
    paddingRight: 15
  },
  phaseReadySwitchContainer: {
    paddingTop: 25,
    paddingRight: 15
  },
  datePickerContainer: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10
  },
  topicTaskIconBackground: {
    margin: 10,
    marginTop: 12,
    position: "absolute",
    height: 50,
    width: 50,
    borderRadius: 90,
    borderTopColor: "#11511D",
    borderTopWidth: 50,
    borderRightWidth: 50,
    borderRightColor: "#88B620",
    zIndex: -1
  },
  taskIcon: {
    paddingTop: 7,
    height: 50,
    width: 50,
    borderRadius: 90,
    alignSelf: "center"
  },
  progressIcon: {
    paddingTop: 5,
    height: 50,
    width: 50,
    alignSelf: "center"
  }
});
