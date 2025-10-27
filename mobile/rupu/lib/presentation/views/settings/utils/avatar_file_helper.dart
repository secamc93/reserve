import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';

import '../models/avatar_file_data.dart';

class AvatarFileHelper {
  static const int _maxDimension = 1024;
  static const int _targetMaxBytes = 500 * 1024; // 500 KB
  static const int _maxBaseNameLength = 40;

  const AvatarFileHelper._();

  static Future<AvatarFileData?> process(PlatformFile file) async {
    final sourcePath = file.path;
    if (sourcePath == null) return null;

    final originalFile = File(sourcePath);
    if (!await originalFile.exists()) return null;

    final bytes = await originalFile.readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) return null;

    final oriented = img.bakeOrientation(decoded);
    final resized = _resizeIfNeeded(oriented);
    final compressed = _compressToTarget(resized);

    final sanitizedName = _buildFileName(file.name);
    final tempDir = await getTemporaryDirectory();
    final outputFile = File('${tempDir.path}/$sanitizedName');
    await outputFile.writeAsBytes(compressed, flush: true);

    return AvatarFileData(
      path: outputFile.path,
      fileName: sanitizedName,
      sizeInBytes: compressed.length,
    );
  }

  static img.Image _resizeIfNeeded(img.Image image) {
    final maxSide = image.width > image.height ? image.width : image.height;
    if (maxSide <= _maxDimension) return image;

    final ratio = _maxDimension / maxSide;
    final width = (image.width * ratio).round();
    final height = (image.height * ratio).round();

    return img.copyResize(
      image,
      width: width,
      height: height,
      interpolation: img.Interpolation.average,
    );
  }

  static List<int> _compressToTarget(img.Image image) {
    const qualities = [85, 75, 65, 55, 45, 35];
    for (final quality in qualities) {
      final encoded = img.encodeJpg(image, quality: quality);
      if (encoded.length <= _targetMaxBytes || quality == qualities.last) {
        return encoded;
      }
    }
    return img.encodeJpg(image, quality: qualities.last);
  }

  static String _buildFileName(String originalName) {
    final dotIndex = originalName.lastIndexOf('.');
    var baseName =
        dotIndex == -1 ? originalName : originalName.substring(0, dotIndex);

    baseName = baseName.toLowerCase();
    baseName = baseName.replaceAll(RegExp(r'[^a-z0-9]+'), '_');
    baseName = baseName.replaceAll(RegExp(r'_+'), '_');
    baseName = baseName.replaceAll(RegExp(r'^_|_$'), '');

    if (baseName.isEmpty) {
      baseName = 'avatar';
    }

    if (baseName.length > _maxBaseNameLength) {
      baseName = baseName.substring(0, _maxBaseNameLength);
    }

    final now = DateTime.now();
    final timestamp =
        '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}_${now.hour.toString().padLeft(2, '0')}${now.minute.toString().padLeft(2, '0')}${now.second.toString().padLeft(2, '0')}';

    return '${baseName}_$timestamp.jpg';
  }
}
