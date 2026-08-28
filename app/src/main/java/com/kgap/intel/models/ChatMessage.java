package com.kgap.intel.models;

public class ChatMessage {
    private String text;
    private boolean isOutgoing;

    public ChatMessage(String text, boolean isOutgoing) {
        this.text = text;
        this.isOutgoing = isOutgoing;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public boolean isOutgoing() { return isOutgoing; }
    public void setOutgoing(boolean outgoing) { isOutgoing = outgoing; }
}
