import React, { Dispatch } from "react";
import BasicLayout from "../layout/BasicLayout";
import TopBar from "../layout/TopBar";
import { Text, View, Input } from "native-base";
import { StoreState, AccessToken, CourseTopic, NewsItem } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import { HeaderProps, FlatList } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert, StyleSheet, Button, TouchableOpacity, Image } from "react-native";
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
    paddingHorizontal: 15
  },
  successBadge: {
    backgroundColor: "#95C11F"
  },
  failBadge: {
    backgroundColor: "#c1351f"
  }
});

/**
 * Component for application main screen
 */
class NewsScreen extends React.Component<Props, State> {

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
    const assignment = await this.findAssignment(this.props.activityid);
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

    return (
      <BasicLayout navigation={this.props.navigation} loading={this.state.loading} backgroundColor="#fff">
        <View style={defaultStyles.topicHeadline}>
        <Image style={defaultStyles.taskIcon} source={icons.MinaAsiakasIcon} resizeMode={"contain"}/>
          <Text style={[defaultStyles.topicHeadlineText]}>{this.state.selectedAssignment ? this.state.selectedAssignment.title : ""}</Text>
        </View>
        <View style={{margin: 25}}>
          <View>
            <Text>{this.state.selectedAssignment ? TextCleanup.cleanUpText(this.state.selectedAssignment.intro) : ""}</Text>
            <Text>{this.state.selectedAssignment ? `${strings.deadline}: ${this.state.selectedAssignment.duedate.toDateString()}` : ""}</Text>
            <View style={styles.badgeContainer}>
              {this.state.selectedAssignment ?
              (this.state.selectedAssignment.submissionStatus ? <Text style={[styles.badge, styles.successBadge]}>Lähetetty Arvioitavaksi</Text>
              : <Text style={[styles.badge, styles.failBadge]}>Ei palautusta</Text>)
              : <View/>}
              {this.state.selectedAssignment ?
              (this.state.selectedAssignment.gradingStatus ? <Text style={[styles.badge, styles.successBadge]}>Arvioitu</Text>
              : <Text style={[styles.badge, styles.failBadge]}>Ei arvioitu</Text>)
              : <View/>}
            </View>
          </View>
          <TouchableOpacity style={styles.addFileButton} onPress={() => this.pickFile()}>
            <Icon size={50} name="paperclip" type="evilicon"/>
            <View style={defaultStyles.listTextContainer}>
              <Text style={defaultStyles.listItemText}>
                {this.state.selectedFile ? this.state.selectedFile.fileName : (this.state.selectedAssignment.previousSubmission ?
                  this.state.selectedAssignment.previousSubmission : "Lisää tiedosto")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {this.state.selectedFile ?
          <Button color={"#88B620"} title="Tallenna" onPress={() =>
            this.sendFileToAssignment()}></Button> : <View/>}
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

    const submissionData = {
      files_filemanager: this.state.selectedFile ? this.state.selectedFile.itemId : ""
    }

    const saveSubmission = await service.saveSubmission({assignmentid: this.props.activityid || 0, plugindata: submissionData}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    const submitSubmission = await service.submitForGrading({assignmentid: this.props.activityid || 0, acceptsubmissionstatement: true}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    return Alert.alert(strings.submissionSent);
  }

  /**
   * Lets user pick a file and send it to moodle draft area via upload.php
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

    const fileUri = pickedFile.uri;

    if (pickedFile.size && this.state.selectedAssignment && pickedFile.size > this.state.selectedAssignment.maxsize) {
      return Alert.alert(strings.uploadFailedError, strings.fileTooLargeError);
    }

    const data = new FormData();
    data.append("file", {uri: fileUri, type: pickedFile.type, name: pickedFile.name});
    data.append("token", this.props.moodleToken);
    const res: any = await fetch("https://ppo-test.metatavu.io/webservice/upload.php", {
      method: "POST",
      body: data
    }).catch((e) => {
      return Alert.alert(strings.uploadFailedError);
    });
    const reponseObject = JSON.parse(res._bodyText);
    const selectedFile: SelectedFile = {
      fileName: reponseObject[0].filename,
      itemId: reponseObject[0].itemid
    }
    this.setState({selectedFile});
  }

  /**
   * Finds assignment based on activity id
   * @param activityId activity id to find the assignment with
   */
  private async findAssignment(activityId: number) {
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
            maxsize: 1000000000,
            submissionStatus: false,
            gradingStatus: assignStatus.lastattempt.graded || false,
            previousSubmission: ""
          }
          if (assignStatus.lastattempt.submission.status === "submitted") {
            selectedAssignment.submissionStatus = true;
          }
          for (const conf of assign.configs) {
            if (conf.name === "maxsubmissionsizebytes") {
              selectedAssignment.maxsize = conf.value;
              break;
            }
          }
          for (const plugin of assignStatus.lastattempt.submission.plugins) {
            if (plugin.name === "File submissions" && plugin.fileareas[0].files.length > 0) {
              selectedAssignment.previousSubmission = plugin.fileareas[0].files[0].filename;
            }
          }

          this.setState({selectedAssignment})
        }
      }
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

export default connect(mapStateToProps, mapDispatchToProps)(NewsScreen);
