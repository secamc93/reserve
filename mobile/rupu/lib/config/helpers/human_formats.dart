import 'package:intl/intl.dart';

class HumanFormats {
  static String number(double number) {
    final formattedNumber = NumberFormat.compactCurrency(
      decimalDigits: 0,
      symbol: '',
      locale: 'en',
    ).format(number);

    return formattedNumber;
  }
}

String toRfc3339(DateTime dt) {
  final utc = dt.toUtc();
  // Nota: entre comillas simples para imprimir 'T' y 'Z' literales.
  return DateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").format(utc);
}
