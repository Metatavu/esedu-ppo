import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screenHeader: {
    backgroundColor: "#53B02B",
    color: "white",
    width: "100%",
    padding: 15,
    textAlign: "center",
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    fontSize: 20
  },
  listContainer: {
    paddingTop: 25,
    marginHorizontal: 10,
    marginBottom: 0
  },
  listItemBase: {
    flex: 1,
    paddingHorizontal: 15,
    margin: 15,
    marginBottom: 0,
    marginTop: 10,
    height: 95,
    borderWidth: 1,
    borderColor: "#53B02B",
    backgroundColor: "#53B02B",
    borderRadius: 7,
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  listItemInactive: {
    borderColor: "#8f8f8f",
    backgroundColor: "#fff"
  },
  listItemText: {
    flex: 1,
    textAlignVertical: "center",
    fontSize: 19,
    letterSpacing: 0,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400"
  },
  listTextContainer: {
    flex: 1,
    alignItems: "flex-start"
  },
  listItemInactiveText: {
    color: "#8f8f8f"
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
  taskIcon: {
    height: 60,
    width: 60,
    alignSelf: "center",
    marginRight: 12,
    borderRadius: 90
  },
  progressIcon: {
    alignSelf: "center"
  },
  newsHeadline: {
    margin: 10,
    fontSize: 20,
    fontWeight: "bold"
  },
  newsText: {
    margin: 10
  },
  newsFooterText: {
    margin: 10,
    fontSize: 14,
    fontStyle: "italic"
  },
  active: {
    color: "#fff"
  },
  topicHeadline: {
    padding: 10,
    height: 100,
    backgroundColor: "#53B02B",
    alignItems: "flex-start",
    flexDirection: "row",
    textAlignVertical: "center",
    textAlign: "center"
  },
  topicHeadlineText: {
    textAlignVertical: "center",
    margin: 10,
    fontSize: 18,
    width: 275,
    height: 60,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    color: "white"
  }
});
