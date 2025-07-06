import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type AnalyticsEvent = {
  event_type: 'widget_load' | 'widget_error' | 'voice_chat_start' | 'voice_chat_end' | 'mic_permission_denied';
  user_id: string;
  metadata?: Record<string, any>;
  timestamp?: string;
};

class AnalyticsService {
  private supabase = createClientComponentClient();

  async trackEvent(event: AnalyticsEvent) {
    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert({
          ...event,
          timestamp: event.timestamp || new Date().toISOString()
        });

      if (error) {
        console.error('Analytics error:', error);
      }
    } catch (err) {
      console.error('Failed to track analytics event:', err);
    }
  }

  async trackWidgetLoad(userId: string, success: boolean, error?: string) {
    await this.trackEvent({
      event_type: 'widget_load',
      user_id: userId,
      metadata: { success, error }
    });
  }

  async trackWidgetError(userId: string, error: Error) {
    await this.trackEvent({
      event_type: 'widget_error',
      user_id: userId,
      metadata: {
        error_message: error.message,
        error_stack: error.stack
      }
    });
  }

  async trackVoiceChatSession(userId: string, startTime: Date, endTime?: Date) {
    if (!endTime) {
      await this.trackEvent({
        event_type: 'voice_chat_start',
        user_id: userId,
        timestamp: startTime.toISOString()
      });
    } else {
      await this.trackEvent({
        event_type: 'voice_chat_end',
        user_id: userId,
        metadata: {
          duration_seconds: Math.round((endTime.getTime() - startTime.getTime()) / 1000)
        },
        timestamp: endTime.toISOString()
      });
    }
  }

  async trackMicrophonePermission(userId: string, granted: boolean) {
    if (!granted) {
      await this.trackEvent({
        event_type: 'mic_permission_denied',
        user_id: userId
      });
    }
  }
}

export const analytics = new AnalyticsService(); 