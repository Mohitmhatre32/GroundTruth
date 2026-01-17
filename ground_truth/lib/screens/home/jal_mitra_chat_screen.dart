import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/app_colors.dart';
import '../../services/gemini_service.dart';
import 'package:flutter/scheduler.dart';

class JalMitraChatScreen extends StatefulWidget {
  const JalMitraChatScreen({super.key});

  @override
  State<JalMitraChatScreen> createState() => _JalMitraChatScreenState();
}

class _JalMitraChatScreenState extends State<JalMitraChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [
    ChatMessage(
      text: 'Hello! I\'m Jal-Mitra. How can I help you with your groundwater today?',
      isUser: false,
      timestamp: DateTime.now(),
    ),
  ];
  bool _isTyping = false;
  final ScrollController _scrollController = ScrollController();
  final String _currentStationName = "Ludhiana Block A"; // Should come from selected station

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(
        text: text,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _isTyping = true;
    });
    
    _scrollToBottom();
    _messageController.clear();

    // Call Gemini
    final response = await GeminiService().sendMessage(text);

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add(ChatMessage(
          text: response,
          isUser: false,
          timestamp: DateTime.now(),
        ));
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jal-Mitra AI Advisory'),
        backgroundColor: AppColors.primaryBlue,
      ),
      body: Column(
        children: [
          // Sticky Context Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppColors.lightGrey,
            child: Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: AppColors.primaryBlue),
                const SizedBox(width: 8),
                Text(
                  'Advising for: $_currentStationName',
                  style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primaryBlue),
                ),
              ],
            ),
          ),

          // Chat Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16, left: 8),
                      child: const Text(
                        'Jal-Mitra is typing...',
                        style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                      ),
                    ),
                  );
                }
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),

          // Suggestion Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _SuggestionChip(
                  label: 'Can I plant Rice?',
                  onTap: () => _sendMessage('Can I plant Rice?'),
                ),
                const SizedBox(width: 8),
                _SuggestionChip(
                  label: 'Government Schemes',
                  onTap: () => _sendMessage('Tell me about government schemes'),
                ),
                const SizedBox(width: 8),
                _SuggestionChip(
                  label: 'Water Management',
                  onTap: () => _sendMessage('Water management tips'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Input Area
          Container(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Ask Jal-Mitra...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
                const SizedBox(width: 8),
                FloatingActionButton(
                  onPressed: () =>
                      _sendMessage(_messageController.text),
                  mini: true,
                  backgroundColor: AppColors.primaryBlue,
                  child: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: message.isUser ? AppColors.primaryBlue : AppColors.lightGrey,
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomRight: message.isUser ? Radius.zero : null,
            bottomLeft: !message.isUser ? Radius.zero : null,
          ),
        ),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        child: Text(
          message.text,
          style: TextStyle(
            color: message.isUser ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
}

class _SuggestionChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _SuggestionChip({
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.primaryBlue),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.primaryBlue,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}
