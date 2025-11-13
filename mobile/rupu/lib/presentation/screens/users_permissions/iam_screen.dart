import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/iam/iam_view.dart';

class IamScreen extends StatelessWidget {
  static const name = 'iam-screen';
  final int pageIndex;

  const IamScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    IamBinding.register();
    return IamView(pageIndex: pageIndex);
  }
}
