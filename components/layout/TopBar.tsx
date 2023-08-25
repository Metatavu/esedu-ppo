import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import strings from "../../localization/strings";
import { NavigationActions, StackActions } from "react-navigation";
import { NavigationStackProp } from "react-navigation-stack";
import { accessTokenUpdate, localeUpdate, selectAccessToken, selectLocale } from "../../features/common-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Icon } from "native-base";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";

/**
 * Component props
 */
interface Props {
  showLogout?: boolean;
  header?: string;
  showHeader?: boolean;
  showCancel?: boolean;
  showBack: boolean;
  textColor?: string;
  navigation: NavigationStackProp;
}

/**
 * Top bar component
 */
const TopBar = ({ showLogout, header, showHeader, showCancel, textColor, navigation, showBack }: Props) => {
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
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: "row-reverse", paddingLeft: 10, paddingRight: 10, alignItems: "center", justifyContent: "space-between" }}>
          {showHeader &&
            <Text style={header &&
              header.length > 20 ?
              { fontSize: 18, color: textColor || "#000" } : { fontSize: 25, color: textColor || "#fff" }}>{header}</Text>
          }
          {showCancel &&
            <Text onPress={() => navigation
              .reset([NavigationActions.navigate({ routeName: "Main" })], 0)} style={{ color: textColor || "#fff" }}>
              {strings.cancelButtonText}
            </Text>
          }
          {showLogout &&
            <Menu>
              <MenuTrigger>
                <Icon size={40} style={{ padding: 20 }} color="#10511E" name="menu"></Icon>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => toggleLocale()}>
                  <Text>{strings.language}</Text>
                </MenuOption >
                <MenuOption onSelect={() => logout()}>
                  <Text>{strings.logout}</Text>
                </MenuOption>
                <MenuOption />
              </MenuOptions>
            </Menu>
          }
          {showBack &&
            <TouchableOpacity style={{ padding: 20 }} onPress={() => navigation.goBack(null)}>
              <Icon name="arrow-back" />
            </TouchableOpacity>
          }
        </View>
      </View>
    </View>
  );
};

export default TopBar;
