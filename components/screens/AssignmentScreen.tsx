import React, { useEffect, useState } from "react";
import BasicLayout from "../layout/BasicLayout";
import { Text, View } from "native-base";
import { ScrollView } from "react-navigation";
import Api from "moodle-ws-client";
import { Alert, StyleSheet, Button, TouchableOpacity, Image, TextInput } from "react-native";
import defaultStyles from "../../styles/default-styles";
import strings from "../../localization/strings";
import TextCleanup from "../../utils/TextCleanup";
import * as DocumentPicker from 'expo-document-picker';
import * as icons from "../../static/icons/index";
import { NavigationStackProp } from "react-navigation-stack";
import { useAppSelector } from "../../app/hooks";
import { selectMoodleToken, selectSelectedActivityId, selectSelectedSectionId } from "../../features/common-slice";
import config from "../../app/config";
import StyledIcon from "../generic/StyledIcon";

/**
 * Component props
 */
interface Props {
  navigation: NavigationStackProp;
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
};

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

const AssignmentScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>();
  const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment>();
  const [text, setText] = useState<string>();

  const courseid = useAppSelector(selectSelectedSectionId);

  const moodleToken = useAppSelector(selectMoodleToken);
  if (!moodleToken) {
    navigation.navigate("Login");
    return null;
  }

  const activityid = useAppSelector(selectSelectedActivityId);
  if (!activityid) {
    navigation.navigate("Main");
    return null;
  }

  /**
   * Sends the area from draft area to the assignment and submits the assignment
   */
  const sendFileToAssignment = async () => {
    if (!moodleToken) {
      return navigation.navigate("Login");
    }
    const service = Api.getModAssignService(config.hostUrl, moodleToken);

    var submissionData: any;
    if (selectedFile) {
      submissionData.files_filemanager = selectedFile.itemId;
    }
    if (text?.length && text?.length > 0) {
      submissionData.onlinetext_editor = {
        text: "<p>" + text + "</p>",
        format: 1,
        itemid: 0,
      }
    }

    await service.saveSubmission({assignmentid: activityid || 0, plugindata: submissionData}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    await service.submitForGrading({assignmentid: activityid || 0, acceptsubmissionstatement: true}).catch((e) => {
      return Alert.alert(strings.errorSavingSubmission);
    });

    return Alert.alert(strings.submissionSent);
  };

  const pickFile = async () => {
    let result;
    
    try {
      result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    } catch (e) {
      return Alert.alert("Error selecting files");
    }
  
    if (!result || result.canceled || !result.output) {
      return;
    }
  
    const { output } = result;

    const pickedFile = output.length ? output[0] : null;

    if (!pickedFile) {
      return;
    }

    if (pickedFile.size && selectedAssignment && pickedFile.size > selectedAssignment.maxsize) {
      return Alert.alert(strings.uploadFailedError, strings.fileTooLargeError);
    }
  
    const fileUri = URL.createObjectURL(pickedFile);
    const data = new FormData();
    data.append("file", JSON.stringify({uri: fileUri, type: pickedFile.type, name: pickedFile.name}));
    data.append("token", moodleToken);
  
    let uploadResponse: any;
  
    try {
      uploadResponse = await fetch(config.hostUrl + "/webservice/upload.php", {
        method: "POST",
        body: data
      });
    } catch (e) {
      return Alert.alert(strings.uploadFailedError);
    }
  
    const uploadInfo = JSON.parse(uploadResponse._bodyText);
    const selectedFile = {
      fileName: uploadInfo[0].filename,
      itemId: uploadInfo[0].itemid
    }
  
    setSelectedFile(selectedFile);
  };

  /**
   * Finds assignment based on activity id
   * @param activityId activity id to find the assignment with
   */
  const findAssignment = async (activityId: number) => {
    try {
      const moodleService = Api.getModAssignService(config.hostUrl, moodleToken || "")
      const assignList: any = await moodleService.getAssignments({courseids: courseid ? [courseid] : undefined});
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

  useEffect(() => {
    setLoading(true);
    
    findAssignment(activityid)
      .catch((e) => {
        return Alert.alert(strings.pageContentErrorText);
      })
      .then((selectedAssignment) => {
        if (selectedAssignment) {
          setSelectedAssignment(selectedAssignment);
        }
        setLoading(false);
      });
  });  
  
  if (!selectedAssignment) {
    return(
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">

    </BasicLayout>
    )
  }

  const badgeSubmissionStatus =
    selectedAssignment.submissionStatus ? <Text style={[styles.badge, styles.successBadge]}>{strings.sentForReview}</Text>
    : <Text style={[styles.badge, styles.failBadge]}>{strings.notSentForReview}</Text>;

  const badgeReviewStatus =
    selectedAssignment.gradingStatus ? <Text style={[styles.badge, styles.successBadge]}>{strings.graded}</Text>
    : <Text style={[styles.badge, styles.failBadge]}>{strings.notGraded}</Text>;

  return (
    <BasicLayout navigation={navigation} loading={loading} backgroundColor="#fff">
      <View style={defaultStyles.topicHeadline}>
        <Image style={defaultStyles.taskIcon} source={icons.TaskIcon} resizeMode={"contain"}/>
        <Text style={[defaultStyles.topicHeadlineText]}>{selectedAssignment ? selectedAssignment.title : ""}</Text>
      </View>
      <ScrollView>
      <View style={{margin: 25}}>
        <View>
          <Text>{selectedAssignment ? TextCleanup.cleanUpText(selectedAssignment.intro) : ""}</Text>
          <View style={styles.badgeContainer}>
            {badgeSubmissionStatus}
            {badgeReviewStatus}
          </View>
        </View>
        <TouchableOpacity onPress= {() => pickFile()}>
          {selectedFile && <View style={styles.listItemBase}>
            <StyledIcon style={{width: 40}} size={30} name="archive"/>
            <View style={[defaultStyles.listTextContainer]}>
            <Text style={defaultStyles.listItemText}>{selectedFile.fileName}</Text>
            </View>
          </View>}
          <View style={styles.listItemBase}>
            <StyledIcon style={{width: 40}} size={30} name="paperclip"/>
            <View style={[defaultStyles.listTextContainer]}>
              <Text style={defaultStyles.listItemText}>{strings.selectFile}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TextInput 
          multiline={true}
          numberOfLines={10}
          onChangeText={(text: string) => setText(text)}
          value={text}
          style={{ height:200, textAlignVertical: 'top'}}/>
      </View>

      {selectedFile || text ?
        <Button color={"#88B620"} title="Tallenna" onPress={() => sendFileToAssignment()}></Button> : <View/>}
      </ScrollView>
    </BasicLayout>
  );
};

export default AssignmentScreen;
