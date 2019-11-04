export default class TextCleanup {
  /**
   * Removes html markings from a string.
   * @param text string to clean
   */
  public static cleanUpText(text: string) {
    text = text.replace("</p>", " ");
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  }
}