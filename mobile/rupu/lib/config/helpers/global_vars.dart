final class GlobVars {
  static bool desarrollo = true;

  static String baseUrl = desarrollo
      ? "https://www.xn--rup-joa.com/api/v1"
      : "https://cam-x570-aorus-elite-wifi.tail07bf84.ts.net/api/v1";

  /// Altura del bottom navigation bar customizado (usado para padding en vistas con FAB)
  static const double kBottomNavHeight = 100;
}
