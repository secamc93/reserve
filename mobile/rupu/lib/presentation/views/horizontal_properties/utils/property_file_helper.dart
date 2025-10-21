import 'package:file_picker/file_picker.dart';
import 'package:rupu/presentation/views/settings/utils/avatar_file_helper.dart';

import '../models/property_file_data.dart';

class PropertyFileHelper {
  const PropertyFileHelper._();

  static Future<PropertyFileData?> process(PlatformFile file) async {
    final processed = await AvatarFileHelper.process(file);
    if (processed == null) return null;
    return PropertyFileData(
      path: processed.path,
      fileName: processed.fileName,
      sizeInBytes: processed.sizeInBytes,
    );
  }
}

