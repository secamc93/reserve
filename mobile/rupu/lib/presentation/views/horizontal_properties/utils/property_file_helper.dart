import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:mime/mime.dart';
import 'package:path/path.dart' as p;

import '../models/property_file_data.dart';

class PropertyFileHelper {
  const PropertyFileHelper._();

  static const _allowedExtensions = <String>{
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.heic',
    '.heif',
  };

  static Future<PropertyFileData?> process(PlatformFile file) async {
    final path = file.path;
    if (path == null || path.isEmpty) return null;

    final source = File(path);
    if (!await source.exists()) return null;

    final fileName = _buildFileName(
      file.name.isNotEmpty ? file.name : p.basename(path),
    );

    final ext = p.extension(fileName).toLowerCase();
    if (ext.isEmpty || !_allowedExtensions.contains(ext)) {
      final detected = lookupMimeType(path);
      if (detected == null || !detected.startsWith('image/')) {
        return null;
      }
    }

    final size = file.size > 0 ? file.size : await source.length();

    return PropertyFileData(
      path: path,
      fileName: fileName,
      sizeInBytes: size,
    );
  }

  static String _buildFileName(String originalName) {
    final trimmed = originalName.trim();
    final ext = p.extension(trimmed);
    var base = ext.isEmpty
        ? trimmed
        : trimmed.substring(0, trimmed.length - ext.length);

    base = base.toLowerCase();
    base = base.replaceAll(RegExp(r'[^a-z0-9]+'), '_');
    base = base.replaceAll(RegExp(r'_+'), '_');
    base = base.replaceAll(RegExp(r'^_|_$'), '');

    if (base.isEmpty) {
      base = 'property_file';
    }

    if (base.length > 40) {
      base = base.substring(0, 40);
    }

    final extension = ext.isEmpty ? '' : ext.toLowerCase();
    return '$base$extension';
  }
}

