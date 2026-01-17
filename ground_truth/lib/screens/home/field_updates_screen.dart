import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../utils/app_colors.dart';

class FieldUpdatesScreen extends StatefulWidget {
  const FieldUpdatesScreen({Key? key}) : super(key: key);

  @override
  State<FieldUpdatesScreen> createState() => _FieldUpdatesScreenState();
}

class _FieldUpdatesScreenState extends State<FieldUpdatesScreen> {
  final _levelController = TextEditingController();
  final _notesController = TextEditingController();
  XFile? _selectedImage;
  final _imagePicker = ImagePicker();

  @override
  void dispose() {
    _levelController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Updates'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info Card
            Card(
              color: AppColors.lightBlue,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: AppColors.waterBlue,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Submit field observations and manual readings to verify sensor data',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Form Title
            Text(
              'Submit Verification',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),

            // Station Selection
            Text(
              'Select Station',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField(
              items: const [
                DropdownMenuItem(value: '1', child: Text('River Station - North')),
                DropdownMenuItem(value: '2', child: Text('Aquifer Monitoring - West')),
                DropdownMenuItem(value: '3', child: Text('Well Station - South')),
              ],
              onChanged: (_) {},
              decoration: const InputDecoration(
                hintText: 'Choose a station',
              ),
            ),
            const SizedBox(height: 16),

            // Water Level Input
            Text(
              'Water Level (meters)',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _levelController,
              decoration: const InputDecoration(
                hintText: 'Enter measured water level',
                prefixIcon: Icon(Icons.straighten),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Photo Capture
            Text(
              'Evidence Photo',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            if (_selectedImage != null)
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: NetworkImage(_selectedImage!.path),
                    fit: BoxFit.cover,
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.borderGrey, width: 2),
                  borderRadius: BorderRadius.circular(8),
                  color: AppColors.lightGrey,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.image_outlined,
                      size: 32,
                      color: AppColors.textGrey,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No photo selected',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.camera_alt_outlined),
                    label: const Text('Take Photo'),
                    onPressed: _capturePhoto,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.photo_library_outlined),
                    label: const Text('Choose Photo'),
                    onPressed: _selectPhoto,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Notes
            Text(
              'Notes (Optional)',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                hintText: 'Add any observations or notes',
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.check_circle_outlined),
                label: const Text('Submit Verification'),
                onPressed: _submitVerification,
              ),
            ),
            const SizedBox(height: 32),

            // Recent Submissions
            Text(
              'Recent Submissions',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            _SubmissionItem(
              station: 'River Station - North',
              level: '4.5m',
              notes: 'Water level stable',
              timestamp: '2 hours ago',
              status: 'SYNCED',
            ),
            _SubmissionItem(
              station: 'Well Station - South',
              level: '5.8m',
              notes: 'Critical level reached',
              timestamp: '5 hours ago',
              status: 'SYNCED',
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _capturePhoto() async {
    try {
      final image = await _imagePicker.pickImage(source: ImageSource.camera);
      if (image != null) {
        setState(() => _selectedImage = image);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _selectPhoto() async {
    try {
      final image = await _imagePicker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() => _selectedImage = image);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  void _submitVerification() {
    if (_levelController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter water level')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Verification submitted successfully'),
        backgroundColor: AppColors.safeGreen,
      ),
    );

    _levelController.clear();
    _notesController.clear();
    setState(() => _selectedImage = null);
  }
}

class _SubmissionItem extends StatelessWidget {
  final String station;
  final String level;
  final String notes;
  final String timestamp;
  final String status;

  const _SubmissionItem({
    required this.station,
    required this.level,
    required this.notes,
    required this.timestamp,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        station,
                        style: Theme.of(context).textTheme.titleSmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        level,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.safeGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    status,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.safeGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              notes,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textGrey,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              timestamp,
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ],
        ),
      ),
    );
  }
}
