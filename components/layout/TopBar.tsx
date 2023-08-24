import React from "react";
import { Text, View, TouchableHighlight } from "react-native";
import strings from "../../localization/strings";
import { NavigationActions, StackActions } from "react-navigation";
import { NavigationStackProp } from "react-navigation-stack";
import { accessTokenUpdate, localeUpdate, selectAccessToken, selectLocale } from "../../features/common-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

/**
 * Component props
 */
interface Props {
  showLogout?: boolean;
  header?: string;
  showMenu?: boolean;
  showUser?: boolean;
  showHeader?: boolean;
  showCancel?: boolean;
  textColor?: string;
  navigation: NavigationStackProp;
}

/**
 * Top bar component
 */
const TopBar = ({ showLogout, header, showMenu, showUser, showHeader, showCancel, textColor, navigation }: Props) => {
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectLocale);
  const accessToken = useAppSelector(selectAccessToken);

  /**
   * Toggles selected language
   */
  const toggleLocale = () => {
    const currentLocale = strings.getLanguage();
    if (currentLocale === "fi") {
      strings.setLanguage("en");
      dispatch(localeUpdate("en"));
    } else {
      strings.setLanguage("fi");
      dispatch(localeUpdate("fi"));
    }
  }

  /**
   * Logout function
   */
  const logout = () => {
    dispatch(accessTokenUpdate(undefined));

    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Login" })]
    });

    navigation.reset([resetAction], 0);
  }

  return (
    <View style={{flex: 1}}>
      <View style={{height: 50}}>
        <View style={{flex: 1, flexDirection: "row", paddingLeft: 10, paddingRight: 10, alignItems: "center", justifyContent: "space-between"}}>

          {showMenu &&
            <TouchableHighlight onPress={toggleLocale} style={{paddingLeft: 10}}>
              <Text style={{color: textColor || "#000"}}>{locale === "fi" ? "In english" : "Suomeksi"}</Text>
            </TouchableHighlight>
          }

          {showHeader &&
            <Text style={header &&
               header.length > 20 ?
               { fontSize: 18, color: textColor || "#000"} : { fontSize: 25, color: textColor || "#fff"}}>{header}</Text>
          }

          {showUser &&
            <TouchableHighlight style={{paddingRight: 10}}>
              <Text style={{color: textColor || "#000"}}>
                {accessToken ? accessToken.firstName + " " + accessToken.lastName : ""}
              </Text>
            </TouchableHighlight>
          }

          {showCancel &&
            <Text onPress={() => navigation.reset([NavigationActions.navigate({routeName: "Main"})], 0)} style={{color: textColor || "#fff"}}>
              {strings.cancelButtonText}
            </Text>
          }

          {showLogout &&
            <Text onPress={() => logout()} style={{color: textColor || "#fff"}}>
              {strings.logoutText}
            </Text>
          }
        </View>
      </View>
    </View>
  );
};

export default TopBar;
