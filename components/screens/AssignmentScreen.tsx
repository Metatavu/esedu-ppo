import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View, Input, Textarea } from "native-base";
import { StoreState, AccessToken, CourseTopic, NewsItem } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList, ScrollView } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert, StyleSheet, Button, TouchableOpacity, Image, TextInput } from "react-native";
import defaultStyles from "../../styles/default-styles";
import { HOST_URL, COURSE_IDS } from "react-native-dotenv";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";
import DocumentPicker from "react-native-document-picker";
import { Icon } from "react-native-elements";
import * as icons from "../../static/icons/index";

/**
 * Component props
 */
interface Props {
  navigation: any,
  locale: string,
  accessToken?: AccessToken,
  moodleToken?: string,
  activityid?: number,
  courseid?: number
};

/**
 * Component state
 */
interface State {
  text?: string
  moodleToken?: string,
  loading: boolean,
  error: boolean,
  selectedFile?: SelectedFile,
  selectedAssignment?: SelectedAssignment
};

interface SelectedFile {
  fileName: string,
  itemId: number
}

interface SelectedAssignment {
  title: string,
  intro: string,
  duedate: Date,
  maxsize: number,
  submissionStatus: boolean,
  gradingStatus: boolean,
  previousSubmission: string
}
const styles = StyleSheet.create({
  addFileButton: {
    height: 95,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#53B02B",
    color: "#fff",
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20
  },
  small: {
    fontSize: 10
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  badge: {
    color: "#fff",
    fontSize: 14,
    letterSpacing: 0,
    fontFamily: "sans-serif-condensed",
    fontWeight: "400",
    borderRadius: 7,
    textAlign: "center",
    margin: 5,
    marginLeft: 0,
    paddingHorizontal: 15
  },
  successBadge: {
    backgroundColor: "#95C11F"
  },
  failBadge: {
    backgroundColor: "#00000061"
  },
  listItemBase: {
    flex: 1,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#10511E",
    flexDirection: "row",
    alignContent: "flex-start"
  }
});

/**
 * Component for application main screen
 */
class AssignmentScreen extends React.Component<Props, State> {
  
  /**
   * Constructor
   * 
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      moodleToken: "",
      loading: false,
      error: false
    };
  }

  /**
   * Navigation options
   */
  public static navigationOptions = (props: HeaderProps) => {
    return ({
      headerLeft: null,
      headerTitle: <TopBar showBack={true} navigation={props.navigation} showMenu={true} showHeader={false} showLogout={true} showUser={true} />
    });
  };

  /**
   * Component did mount lifecycle method
   */
  public async componentDidMount() {
    this.setState({loading: true});
    if (!this.props.activityid) {
      return this.props.navigation.navigate("Main");
    }
    const selectedAssignment = await this.findAssignment(this.props.activityid).catch((e) => {
      return Alert.alert(strings.pageContentErrorText);
    });
    if (selectedAssignment) {
      this.setState({selectedAssignment});
    }
    this.setState({loading: false});
  }

  /**
   * Component did update lifecycle method
   * 
   * @param prevProps previous properties
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.locale !== this.props.locale) {
      this.props.navigation.navigate("Assignment");
    }
  }

  
  /**
   * Component render
   */
  public render() {
    if (!this.state.selectedAssignment) {
      return(
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">

      </BasicLayout>
      )
    }

    const badgeSubmissionStatus =
      this.state.selectedAssignment.submissionStatus ? <Text style={[styles.badge, styles.successBadge]}>{strings.sentForReview}</Text>
      : <Text style={[styles.badge, styles.failBadge]}>{strings.notSentForReview}</Text>;

    const badgeReviewStatus =
      this.state.selectedAssignment.gradingStatus ? <Text style={[styles.badge, styles.successBadge]}>{strings.graded}</Text>
      : <Text style={[styles.badge, styles.failBadge]}>{strings.notGraded}</Text>;

    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <View style={defaultStyles.topicHeadline}>
          <Image style={defaultStyles.taskIcon} source={icons.TaskIcon} resizeMode={"contain"}/>
          <Text style={[defaultStyles.topicHeadlineText]}>{this.state.selectedAssignment ? this.state.selectedAssignment.title : ""}</Text>
        </View>
        <ScrollView>
        <View style={{margin: 25}}>
          <View>
            <Text>{this.state.selectedAssignment ? TextCleanup.cleanUpText(this.state.selectedAssignment.intro) : ""}</Text>
            <View style={styles.badgeContainer}>
              {badgeSubmissionStatus}
              {badgeReviewStatus}
            </View>
          </View>
          <TouchableOpacity onPress= {() => this.pickFile()}>
            {this.state.selectedFile && <View style={styles.listItemBase}>
              <Icon containerStyle={[defaultStyles.progressIcon, {width: 40}]} size={30} name="archive" type="evilicon"/>
              <View style={[defaultStyles.listTextContainer]}>
              <Text style={defaultStyles.listItemText}>{this.state.selectedFile.fileName}</Text>
              </View>
            </View>}
            <View style={styles.listItemBase}>
              <Icon containerStyle={[defaultStyles.progressIcon, {width: 40}]} size={30} name="paperclip" type="evilicon"/>
              <View style={[defaultStyles.listTextContainer]}>
                <Text style={defaultStyles.listItemText}>{strings.selectFile}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TextInput 
            multiline={true}
            numberOfLines={10}
            onChangeText={(text: string) => this.setState({text})}
            value={this.state.text}
            style={{ height:200, textAlignVertical: 'top'}}/>
        </View>

        {this.state.selectedFile || this.state.text ?
          <Button color={"#88B620"} title="Tallenna" onPress={() =>
            this.sendFileToAssignment()}></Button> : <View/>}
        </ScrollView>
      </BasicLayout>
    );
  }

  /**
   * Sends the area from draft area to the assignment and submits the assignment
   */
  private async sendFileToAssignment() {
    if (!this.props.moodleToken) {
      return this.props.navigation.navigate("Login");
    }
    const service = Api.getModAssignService(HOST_URL, this.props.moodleToken);

    var submissionData: any;
    if (this.state.selectedFile) {
      submissionData.files_filemanager = this.state.selectedFile.itemId;
    }
    if (this.state.text?.length && this.state.text?.length > 0) {
      submissionData.onlinetext_editor = {
        text: "<p>" + this.state.text + "</p>",
        format: 1,
        itemid: 0,
      }
    }

    await service.saveSubmission({assignmentid: this.props.activityid || 0, plugindata: submissionData}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    await service.submitForGrading({assignmentid: this.props.activityid || 0, acceptsubmissionstatement: true}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    return Alert.alert(strings.submissionSent);
  }

  /**
   * Lets user pick a file and sends it to moodle draft area via upload.php
   */
  private async pickFile() {
    const pickedFile: any = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles]
    }).catch((e) => {
      if (!DocumentPicker.isCancel(e)) {
        return Alert.alert("Error selecting files");
      } else {
        return;
      }
    });

    if (!pickedFile) {
      return;
    }

    if (pickedFile.size && this.state.selectedAssignment && pickedFile.size > this.state.selectedAssignment.maxsize) {
      return Alert.alert(strings.uploadFailedError, strings.fileTooLargeError);
    }

    const fileUri = pickedFile.uri;
    const data = new FormData();
    data.append("file", {uri: fileUri, type: pickedFile.type, name: pickedFile.name});
    data.append("token", this.props.moodleToken);

    const uploadResponse: any = await fetch(HOST_URL + "/webservice/upload.php", {
      method: "POST",
      body: data
    }).catch((e) => {
      return Alert.alert(strings.uploadFailedError);
    });

    const uploadInfo = JSON.parse(uploadResponse._bodyText);
    const selectedFile: SelectedFile = {
      fileName: uploadInfo[0].filename,
      itemId: uploadInfo[0].itemid
    }

    this.setState({selectedFile});
  }

  /**
   * Finds assignment based on activity id
   * @param activityId activity id to find the assignment with
   */
  private async findAssignment(activityId: number) {
    try {
      const moodleService = Api.getModAssignService(HOST_URL, this.props.moodleToken || "")
      const assignList: any = await moodleService.getAssignments({courseids: this.props.courseid ? [this.props.courseid] : undefined});
      for (const courses of assignList.courses) {
        for (const assign of courses.assignments) {
          if (assign.id === activityId) {
            const assignStatus: any = await moodleService.getSubmissionStatus({assignid: assign.id});
            const selectedAssignment: SelectedAssignment = {
              title: assign.name,
              intro: assign.intro,
              duedate: new Date(assign.duedate * 1000),
              maxsize: 0,
              submissionStatus: false,
              gradingStatus: assignStatus.lastattempt.graded || false,
              previousSubmission: ""
            }

            for (const conf of assign.configs) {
              if (conf.name === "maxsubmissionsizebytes") {
                selectedAssignment.maxsize = conf.value;
                break;
              }
            }

            if (assignStatus.lastattempt.submission != null) {
              if (assignStatus.lastattempt.submission.status === "submitted") {
                selectedAssignment.submissionStatus = true;
              }

              for (const plugin of assignStatus.lastattempt.submission.plugins) {
                if (plugin.name === "File submissions" && plugin.fileareas[0].files.length > 0) {
                  selectedAssignment.previousSubmission = plugin.fileareas[0].files[0].filename;
                }
              }
              
            }


            return selectedAssignment;
          }
        }
      }
    } catch(e) {

    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    locale: state.locale,
    moodleToken: state.moodleToken,
    courseid: state.selectedSectionId,
    activityid: state.selectedActivityId
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentScreen);
